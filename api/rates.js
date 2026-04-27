const BAROTEM_TABLE_URL = "https://www.barotem.com/product/productTable/2382r902";
const BAROTEM_LIST_URL = "https://www.barotem.com/product/lists/2382r902";
const GAMEBIT_TOTAL_STATUS_URLS = [
  "https://gamebit.co.kr/jdata2/total_status.json",
  "https://gamebit.co.kr/jdata/total_status.json"
];
const ADREAMER_ADENA_URL = "https://game.adreamer.now/api/prices/adena";
const FX_URL = "https://open.er-api.com/v6/latest/KRW";
const fs = require("fs");
const path = require("path");

const CACHE_TTL_MS = Number(process.env.RATES_CACHE_TTL_MS || 15 * 60 * 1000);
const FX_TTL_MS = 10 * 60 * 1000;
const MARKET_TTL_MS = Number(process.env.RATES_MARKET_TTL_MS || 15 * 60 * 1000);
const ADREAMER_RATE_TTL_MS = Number(
  process.env.RATES_ADREAMER_RATE_TTL_MS || 15 * 60 * 1000
);
const RECENT_PRIORITY_THRESHOLD_MINUTES = 720;
const FETCH_CONCURRENCY = Math.max(1, Number(process.env.RATES_FETCH_CONCURRENCY || 1));
const SERVER_FETCH_SPACING_MS = Math.max(0, Number(process.env.RATES_SERVER_FETCH_SPACING_MS || 450));
const MODE_FETCH_SPACING_MS = Math.max(0, Number(process.env.RATES_MODE_FETCH_SPACING_MS || 1200));
const BAROTEM_FETCH_RETRIES = 2;
const BAROTEM_RETRY_DELAY_MS = 350;
const GAMEBIT_FETCH_RETRIES = 2;
const GAMEBIT_RETRY_DELAY_MS = 400;
const FETCH_TIMEOUT_MS = Number(process.env.RATES_FETCH_TIMEOUT_MS || 8500);
const MODE_FETCH_TIMEOUT_MS = Number(process.env.RATES_MODE_TIMEOUT_MS || 180000);
const MARKET_FETCH_TIMEOUT_MS = Number(process.env.RATES_MARKET_TIMEOUT_MS || 12000);
const FX_FETCH_TIMEOUT_MS = Number(process.env.RATES_FX_TIMEOUT_MS || 9000);
const INITIAL_RESPONSE_WAIT_MS = Number(process.env.RATES_INITIAL_RESPONSE_WAIT_MS || 12000);
const RATES_SNAPSHOT_FILE = path.join(__dirname, "..", "cache", "rates-snapshot.json");

const {
  MODE_CONFIG,
  SERVER_ORDER,
  normalizeServerName
} = require("./server-config");
const { getDeductionProfiles } = require("./price-config");
const { fetchGamebitJson } = require("./gamebit-client");
const { fetchBarotemJson } = require("./barotem-client");
const MULTIPLIER_EPSILON = 1e-12;

let lastSnapshot = null;
let lastSnapshotAt = 0;
let lastSnapshotProfiles = null;

let fxCache = {
  value: null,
  fetchedAt: 0
};

let marketCache = {
  gamebitByOpt1: {},
  adreamerByServer: {},
  fetchedAt: 0
};

let adreamerRateCache = {
  byServer: {},
  fetchedAt: 0
};

let refreshPromise = null;

function ensureSnapshotDir() {
  try {
    const dir = path.dirname(RATES_SNAPSHOT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // Ignore fs errors.
  }
}

function persistSnapshot(snapshot, snapshotProfiles) {
  try {
    if (!snapshot || typeof snapshot !== "object") return;
    const slowRows = snapshot?.modes?.slow?.rows || [];
    const fastRows = snapshot?.modes?.fast?.rows || [];
    const hasAnyData =
      slowRows.some((row) => row?.hasData && Number.isFinite(Number(row?.ratePer10kVnd))) ||
      fastRows.some((row) => row?.hasData && Number.isFinite(Number(row?.ratePer10kVnd)));
    if (!hasAnyData) return;

    ensureSnapshotDir();
    fs.writeFileSync(
      RATES_SNAPSHOT_FILE,
      JSON.stringify(
        {
          savedAt: new Date().toISOString(),
          snapshotProfiles: snapshotProfiles || null,
          snapshot
        },
        null,
        2
      ),
      "utf8"
    );
  } catch {
    // Ignore fs errors.
  }
}

function restoreSnapshotFromDisk() {
  try {
    if (!fs.existsSync(RATES_SNAPSHOT_FILE)) return null;
    const raw = fs.readFileSync(RATES_SNAPSHOT_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const snapshot = parsed?.snapshot;
    if (!snapshot || typeof snapshot !== "object") return null;

    const slowRows = snapshot?.modes?.slow?.rows || [];
    const fastRows = snapshot?.modes?.fast?.rows || [];
    const hasAnyData =
      slowRows.some((row) => row?.hasData && Number.isFinite(Number(row?.ratePer10kVnd))) ||
      fastRows.some((row) => row?.hasData && Number.isFinite(Number(row?.ratePer10kVnd)));
    if (!hasAnyData) return null;

    return {
      snapshot,
      snapshotProfiles: parsed?.snapshotProfiles || null
    };
  } catch {
    return null;
  }
}

function setCorsHeaders(res) {
  if (typeof res?.setHeader !== "function") return;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseKstTimestamp(value) {
  if (!value || typeof value !== "string") return null;
  const iso = `${value.trim().replace(" ", "T")}+09:00`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getTime();
}

function parseRatePer10kKrw(row) {
  const unitPrice = String(row?.unit_price || "");
  const unitMatch = unitPrice.match(/만당\s*([\d,]+)\s*원/);
  if (unitMatch) {
    const parsed = Number(unitMatch[1].replace(/,/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  const baroPrice = Number(String(row?.baro_price || "").replace(/[^\d.]/g, ""));
  const unitEx = Number(String(row?.unit_ex || row?.unit || "").replace(/[^\d.]/g, ""));
  if (Number.isFinite(baroPrice) && Number.isFinite(unitEx) && unitEx > 0) {
    const fallback = Math.round(baroPrice / unitEx);
    if (Number.isFinite(fallback) && fallback > 0) return fallback;
  }

  return null;
}

function isTradableRow(row) {
  return String(row?.transaction_end ?? "0") === "0";
}

function buildCandidate(row) {
  if (!isTradableRow(row)) return null;

  const serverName = normalizeServerName(String(row?.server || "").trim());
  const ratePer10kKrw = parseRatePer10kKrw(row);
  const listedAtTs = parseKstTimestamp(row?.reg_date);

  if (!serverName || !Number.isFinite(ratePer10kKrw) || !Number.isFinite(listedAtTs)) {
    return null;
  }

  return {
    serverName,
    ratePer10kKrw,
    listedAtTs
  };
}

function compareSlowCandidates(a, b) {
  if (a.ratePer10kKrw !== b.ratePer10kKrw) return a.ratePer10kKrw - b.ratePer10kKrw;
  return b.listedAtTs - a.listedAtTs;
}

function compareFastCandidates(a, b) {
  if (a.ratePer10kKrw !== b.ratePer10kKrw) return b.ratePer10kKrw - a.ratePer10kKrw;
  return b.listedAtTs - a.listedAtTs;
}

function isRecentCandidate(candidate, nowTs) {
  const ageMinutes = Math.max(0, Math.floor((nowTs - candidate.listedAtTs) / 60000));
  return ageMinutes <= RECENT_PRIORITY_THRESHOLD_MINUTES;
}

function pickRecentPool(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) return [];
  const nowTs = Date.now();
  const recentPool = candidates.filter((candidate) => isRecentCandidate(candidate, nowTs));
  return recentPool.length ? recentPool : candidates;
}

function percentile(sortedValues, p) {
  if (!Array.isArray(sortedValues) || !sortedValues.length) return null;
  if (sortedValues.length === 1) return sortedValues[0];

  const rank = (p / 100) * (sortedValues.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return sortedValues[low];

  const w = rank - low;
  return sortedValues[low] * (1 - w) + sortedValues[high] * w;
}

function filterFastOutliers(candidates) {
  if (!Array.isArray(candidates) || candidates.length < 6) return candidates;

  const rates = candidates
    .map((candidate) => candidate.ratePer10kKrw)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (rates.length < 6) return candidates;

  const q1 = percentile(rates, 25);
  const q3 = percentile(rates, 75);
  const p5 = percentile(rates, 5);
  const p95 = percentile(rates, 95);

  if (![q1, q3, p5, p95].every((value) => Number.isFinite(value))) {
    return candidates;
  }

  const iqr = q3 - q1;
  const iqrLower = q1 - 1.5 * iqr;
  const iqrUpper = q3 + 1.5 * iqr;

  const lowerBound = Math.max(iqrLower, p5);
  const upperBound = Math.min(iqrUpper, p95);

  if (!Number.isFinite(lowerBound) || !Number.isFinite(upperBound) || lowerBound > upperBound) {
    return candidates;
  }

  const filtered = candidates.filter((candidate) => {
    const value = candidate.ratePer10kKrw;
    return Number.isFinite(value) && value >= lowerBound && value <= upperBound;
  });

  return filtered.length ? filtered : candidates;
}

function selectFastCandidate(candidates) {
  const recentPool = pickRecentPool(candidates);
  if (!recentPool.length) return null;

  const sortedPool = [...recentPool].sort(compareFastCandidates);
  const filteredPool = filterFastOutliers(sortedPool);
  if (!filteredPool.length) return sortedPool[0] || null;

  return [...filteredPool].sort(compareFastCandidates)[0] || null;
}

function selectSlowCandidate(candidates, fastCandidate) {
  const recentPool = pickRecentPool(candidates);
  if (!recentPool.length) {
    return {
      candidate: null,
      crossRuleStatus: "no_slow_data",
      skippedSlowCount: 0
    };
  }

  const sorted = [...recentPool].sort(compareSlowCandidates);
  if (!fastCandidate) {
    return {
      candidate: sorted[0],
      crossRuleStatus: "no_fast_data",
      skippedSlowCount: 0
    };
  }

  for (let index = 0; index < sorted.length; index += 1) {
    if (sorted[index].ratePer10kKrw >= fastCandidate.ratePer10kKrw) {
      return {
        candidate: sorted[index],
        crossRuleStatus: "matched",
        skippedSlowCount: index
      };
    }
  }

  return {
    candidate: sorted[0],
    crossRuleStatus: "fallback_below_fast",
    skippedSlowCount: sorted.length
  };
}

function buildParams(mode, opt1) {
  return new URLSearchParams({
    page: "1",
    sell: mode.sell,
    category: "",
    display: mode.display,
    orderby: mode.orderby,
    minpay: "",
    maxpay: "",
    search_word: "",
    brand: "",
    buyloc: "",
    opt1: opt1 || "",
    opt2: "",
    opt3: "",
    opt4: "",
    opt5: "",
    opt6: "",
    opt7: "",
    opt8: "",
    opt9: "",
    opt10: "",
    total: "no"
  });
}

async function fetchJson(url, headers) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response = null;
  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: headers || {
        Accept: "application/json,text/plain,*/*"
      }
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`timeout ${FETCH_TIMEOUT_MS}ms (${url})`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`http ${response.status} (${url})`);
  }

  return response.json();
}

async function fetchTable(mode, opt1) {
  const params = buildParams(mode, opt1);
  const url = `${BAROTEM_TABLE_URL}?${params.toString()}`;
  const refererParams = new URLSearchParams(params);
  refererParams.delete("total");
  const referer = `${BAROTEM_LIST_URL}?${refererParams.toString()}`;
  const payload = await fetchBarotemJson(url, referer);
  if (!payload || payload.code !== 200 || !Array.isArray(payload.rows)) {
    throw new Error("barotem malformed");
  }

  return payload.rows;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPromiseOrNull(promise, timeoutMs) {
  if (!promise) return null;
  return Promise.race([
    Promise.resolve(promise).catch(() => null),
    sleep(timeoutMs).then(() => null)
  ]);
}

function withTimeout(promise, timeoutMs, label) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(label || `timeout ${timeoutMs}ms`));
    }, timeoutMs);

    Promise.resolve(promise)
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}

function hasMultiplierChanged(previousMultiplier, nextMultiplier) {
  if (!Number.isFinite(previousMultiplier) || !Number.isFinite(nextMultiplier)) return false;
  return Math.abs(previousMultiplier - nextMultiplier) > MULTIPLIER_EPSILON;
}

function normalizeProfiles(profiles) {
  const safe = profiles && typeof profiles === "object" ? profiles : {};
  const lt1m = safe.lt1m && typeof safe.lt1m === "object" ? safe.lt1m : {};
  const gt1m = safe.gt1m && typeof safe.gt1m === "object" ? safe.gt1m : {};
  const fast = safe.fast && typeof safe.fast === "object" ? safe.fast : {};
  return {
    lt1m: {
      deductionPercent: Number(lt1m.deductionPercent),
      multiplier: Number(lt1m.multiplier)
    },
    gt1m: {
      deductionPercent: Number(gt1m.deductionPercent),
      multiplier: Number(gt1m.multiplier)
    },
    fast: {
      deductionPercent: Number(fast.deductionPercent),
      multiplier: Number(fast.multiplier)
    }
  };
}

function hasProfilesChanged(previousProfiles, nextProfiles) {
  const prev = normalizeProfiles(previousProfiles);
  const next = normalizeProfiles(nextProfiles);
  return (
    hasMultiplierChanged(prev.lt1m.multiplier, next.lt1m.multiplier) ||
    hasMultiplierChanged(prev.gt1m.multiplier, next.gt1m.multiplier) ||
    hasMultiplierChanged(prev.fast.multiplier, next.fast.multiplier)
  );
}

function scalePositiveValue(value, ratio) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  const scaled = Math.round(parsed * ratio);
  return Number.isFinite(scaled) && scaled > 0 ? scaled : null;
}

function getSnapshotProfiles(snapshot, fallbackProfiles) {
  const fallback = normalizeProfiles(fallbackProfiles);
  const exchange = snapshot?.source?.exchange || {};
  const profiles = exchange?.deductionProfiles || {};
  const lt1m = profiles?.lt1m || {};
  const gt1m = profiles?.gt1m || {};
  const fast = profiles?.fast || {};

  const legacyDeduction = Number(exchange?.deductionPercent);
  const legacyMultiplier = Number(exchange?.multiplier);

  return normalizeProfiles({
    lt1m: {
      deductionPercent: Number.isFinite(lt1m.deductionPercent)
        ? lt1m.deductionPercent
        : Number.isFinite(legacyDeduction)
          ? legacyDeduction
          : fallback.lt1m.deductionPercent,
      multiplier: Number.isFinite(lt1m.multiplier)
        ? lt1m.multiplier
        : Number.isFinite(legacyMultiplier)
          ? legacyMultiplier
          : fallback.lt1m.multiplier
    },
    gt1m: {
      deductionPercent: Number.isFinite(gt1m.deductionPercent)
        ? gt1m.deductionPercent
        : Number.isFinite(legacyDeduction)
          ? legacyDeduction
          : fallback.gt1m.deductionPercent,
      multiplier: Number.isFinite(gt1m.multiplier)
        ? gt1m.multiplier
        : Number.isFinite(legacyMultiplier)
          ? legacyMultiplier
          : fallback.gt1m.multiplier
    },
    fast: {
      deductionPercent: Number.isFinite(fast.deductionPercent)
        ? fast.deductionPercent
        : Number.isFinite(legacyDeduction)
          ? legacyDeduction
          : fallback.fast.deductionPercent,
      multiplier: Number.isFinite(fast.multiplier)
        ? fast.multiplier
        : Number.isFinite(legacyMultiplier)
          ? legacyMultiplier
          : fallback.fast.multiplier
    }
  });
}

function scaleSnapshotForNewProfiles(snapshot, nextProfiles, fallbackProfiles) {
  if (!snapshot) return snapshot;

  const prevProfiles = getSnapshotProfiles(snapshot, fallbackProfiles);
  const next = normalizeProfiles(nextProfiles);
  const ratioLt1m = Number.isFinite(prevProfiles.lt1m.multiplier) && prevProfiles.lt1m.multiplier > 0
    ? next.lt1m.multiplier / prevProfiles.lt1m.multiplier
    : null;
  const ratioGt1m = Number.isFinite(prevProfiles.gt1m.multiplier) && prevProfiles.gt1m.multiplier > 0
    ? next.gt1m.multiplier / prevProfiles.gt1m.multiplier
    : null;
  const ratioGtFromLt1m = Number.isFinite(prevProfiles.lt1m.multiplier) && prevProfiles.lt1m.multiplier > 0
    ? next.gt1m.multiplier / prevProfiles.lt1m.multiplier
    : null;
  const ratioFast = Number.isFinite(prevProfiles.fast.multiplier) && prevProfiles.fast.multiplier > 0
    ? next.fast.multiplier / prevProfiles.fast.multiplier
    : null;

  if (!Number.isFinite(ratioLt1m) || !Number.isFinite(ratioGt1m) || !Number.isFinite(ratioFast)) {
    return snapshot;
  }

  const scaleRow = (row, includeSlowFields) => {
    if (!row || typeof row !== "object") return row;
    const scaledBase = scalePositiveValue(
      row.ratePer10kVnd,
      includeSlowFields ? ratioLt1m : ratioFast
    );
    const scaledRow = {
      ...row,
      ratePer10kVnd: scaledBase
    };
    if (includeSlowFields) {
      const lt1mScaled = scalePositiveValue(row.ratePer10kVndLt1m, ratioLt1m);
      const gt1mScaled = scalePositiveValue(row.ratePer10kVndGt1m, ratioGt1m);
      scaledRow.ratePer10kVndLt1m = Number.isFinite(lt1mScaled) ? lt1mScaled : scaledBase;
      scaledRow.ratePer10kVndGt1m = Number.isFinite(gt1mScaled)
        ? gt1mScaled
        : scalePositiveValue(row.ratePer10kVnd, ratioGtFromLt1m);
      scaledRow.fastRefRatePer10kVnd = scalePositiveValue(row.fastRefRatePer10kVnd, ratioFast);
      scaledRow.fastRefRatePer10kVndFast = scalePositiveValue(
        row.fastRefRatePer10kVndFast,
        ratioFast
      );
      scaledRow.hasData = Boolean(
        Number.isFinite(scaledBase) ||
          Number.isFinite(scaledRow.ratePer10kVndLt1m) ||
          Number.isFinite(scaledRow.ratePer10kVndGt1m)
      );
    } else {
      scaledRow.ratePer10kVndFast = scalePositiveValue(row.ratePer10kVndFast, ratioFast);
      scaledRow.hasData = Boolean(Number.isFinite(scaledRow.ratePer10kVndFast));
    }
    return scaledRow;
  };

  const scaledSlowRows = (snapshot?.modes?.slow?.rows || []).map((row) => scaleRow(row, true));
  const scaledFastRows = (snapshot?.modes?.fast?.rows || []).map((row) => scaleRow(row, false));
  const scaledNotes = Array.isArray(snapshot?.notes?.crossRuleFallback)
    ? snapshot.notes.crossRuleFallback.map((item) => ({
        ...item,
        slowRatePer10kVnd: scalePositiveValue(item?.slowRatePer10kVnd, ratioLt1m),
        fastRefRatePer10kVnd: scalePositiveValue(item?.fastRefRatePer10kVnd, ratioFast)
      }))
    : [];

  return {
    ...snapshot,
    dataUpdatedAt: new Date().toISOString(),
    isStale: true,
    source: {
      ...snapshot.source,
      exchange: {
        ...(snapshot.source?.exchange || {}),
        deductionPercent: Number.isFinite(next.lt1m.deductionPercent)
          ? Number(next.lt1m.deductionPercent.toFixed(2))
          : null,
        multiplier: Number.isFinite(next.lt1m.multiplier)
          ? Number(next.lt1m.multiplier.toFixed(6))
          : null,
        deductionProfiles: {
          lt1m: {
            deductionPercent: Number.isFinite(next.lt1m.deductionPercent)
              ? Number(next.lt1m.deductionPercent.toFixed(2))
              : null,
            multiplier: Number.isFinite(next.lt1m.multiplier)
              ? Number(next.lt1m.multiplier.toFixed(6))
              : null
          },
          gt1m: {
            deductionPercent: Number.isFinite(next.gt1m.deductionPercent)
              ? Number(next.gt1m.deductionPercent.toFixed(2))
              : null,
            multiplier: Number.isFinite(next.gt1m.multiplier)
              ? Number(next.gt1m.multiplier.toFixed(6))
              : null
          },
          fast: {
            deductionPercent: Number.isFinite(next.fast.deductionPercent)
              ? Number(next.fast.deductionPercent.toFixed(2))
              : null,
            multiplier: Number.isFinite(next.fast.multiplier)
              ? Number(next.fast.multiplier.toFixed(6))
              : null
          }
        }
      }
    },
    modes: {
      slow: {
        ...(snapshot?.modes?.slow || {}),
        rows: scaledSlowRows
      },
      fast: {
        ...(snapshot?.modes?.fast || {}),
        rows: scaledFastRows
      }
    },
    notes: {
      ...(snapshot?.notes || {}),
      crossRuleFallback: scaledNotes
    }
  };
}

async function fetchTableWithRetry(mode, opt1) {
  let lastError = null;
  for (let attempt = 0; attempt <= BAROTEM_FETCH_RETRIES; attempt += 1) {
    try {
      return await fetchTable(mode, opt1);
    } catch (error) {
      lastError = error;
      if (attempt >= BAROTEM_FETCH_RETRIES) break;
      const delayMs = BAROTEM_RETRY_DELAY_MS * (attempt + 1);
      await sleep(delayMs);
    }
  }
  throw lastError || new Error("barotem fetch failed");
}

async function mapLimit(items, limit, worker) {
  if (!items.length) return;
  let nextIndex = 0;

  async function run() {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;
      if (current >= items.length) return;
      await worker(items[current], current);
    }
  }

  const runners = [];
  const runnerCount = Math.min(limit, items.length);
  for (let i = 0; i < runnerCount; i += 1) {
    runners.push(run());
  }
  await Promise.all(runners);
}

async function fetchModeCandidates(mode) {
  const candidatesByServer = new Map();
  const knownServerNames = new Set(
    SERVER_ORDER.map((server) => normalizeServerName(server.serverNameKr))
  );

  function addRows(rows) {
    for (const row of rows) {
      const candidate = buildCandidate(row);
      if (!candidate) continue;
      if (!knownServerNames.has(candidate.serverName)) continue;
      if (!candidatesByServer.has(candidate.serverName)) {
        candidatesByServer.set(candidate.serverName, []);
      }
      candidatesByServer.get(candidate.serverName).push(candidate);
    }
  }

  try {
    const warmupRows = await fetchTableWithRetry(mode, "");
    addRows(warmupRows);
  } catch {
    // Continue with per-server scan.
  }

  if (FETCH_CONCURRENCY <= 1) {
    for (let index = 0; index < SERVER_ORDER.length; index += 1) {
      if (index > 0 && SERVER_FETCH_SPACING_MS > 0) {
        await sleep(SERVER_FETCH_SPACING_MS);
      }

      const server = SERVER_ORDER[index];
      try {
        const rows = await fetchTableWithRetry(mode, server.opt1);
        addRows(rows);
      } catch {
        // Keep partial data when one server fails.
      }
    }
  } else {
    await mapLimit(SERVER_ORDER, FETCH_CONCURRENCY, async (server) => {
      try {
        const rows = await fetchTableWithRetry(mode, server.opt1);
        addRows(rows);
      } catch {
        // Keep partial data when one server fails.
      }
    });
  }

  return candidatesByServer;
}

async function fetchGamebitChanges() {
  let lastError = null;
  for (const statusUrl of GAMEBIT_TOTAL_STATUS_URLS) {
    try {
      const payload = await fetchGamebitJson(statusUrl);
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("gamebit malformed");
      }

      const map = {};
      for (const [opt1, item] of Object.entries(payload)) {
        const parsed = Number(item?.rate);
        if (Number.isFinite(parsed)) {
          map[String(opt1)] = parsed;
        }
      }

      if (Object.keys(map).length > 0) {
        return map;
      }
      throw new Error("gamebit empty rate map");
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("gamebit fetch failed");
}

async function fetchGamebitChangesWithRetry() {
  let lastError = null;
  for (let attempt = 0; attempt <= GAMEBIT_FETCH_RETRIES; attempt += 1) {
    try {
      return await fetchGamebitChanges();
    } catch (error) {
      lastError = error;
      if (attempt >= GAMEBIT_FETCH_RETRIES) break;
      const jitter = Math.floor(Math.random() * 120);
      await sleep(GAMEBIT_RETRY_DELAY_MS * (attempt + 1) + jitter);
    }
  }
  throw lastError || new Error("gamebit fetch failed");
}

async function fetchAdreamerChanges() {
  const payload = await fetchJson(ADREAMER_ADENA_URL);
  if (!Array.isArray(payload)) {
    throw new Error("adreamer malformed");
  }

  const map = {};
  for (const item of payload) {
    const serverName = normalizeServerName(String(item?.server || "").trim());
    const parsed = Number(item?.change);
    if (!serverName || !Number.isFinite(parsed)) continue;
    map[serverName] = parsed;
  }
  return map;
}

async function fetchMarketChanges() {
  const now = Date.now();
  const hasMarketCache =
    Object.keys(marketCache.gamebitByOpt1).length > 0 ||
    Object.keys(marketCache.adreamerByServer).length > 0;

  if (hasMarketCache && now - marketCache.fetchedAt < MARKET_TTL_MS) {
    return {
      ...marketCache,
      fallbackUsed: false
    };
  }

  const [gamebitResult, adreamerResult] = await Promise.allSettled([
    fetchGamebitChangesWithRetry(),
    fetchAdreamerChanges()
  ]);

  const gamebitByOpt1 =
    gamebitResult.status === "fulfilled" ? gamebitResult.value : marketCache.gamebitByOpt1;
  const adreamerByServer =
    adreamerResult.status === "fulfilled" ? adreamerResult.value : marketCache.adreamerByServer;

  const hasAnyData =
    Object.keys(gamebitByOpt1 || {}).length > 0 || Object.keys(adreamerByServer || {}).length > 0;
  if (!hasAnyData) {
    throw new Error("market change unavailable");
  }

  marketCache = {
    gamebitByOpt1,
    adreamerByServer,
    fetchedAt: now
  };

  const hasFreshSource =
    gamebitResult.status === "fulfilled" || adreamerResult.status === "fulfilled";

  const staleUsed = !hasFreshSource;
  const partialFallback = !staleUsed && (gamebitResult.status !== "fulfilled" || adreamerResult.status !== "fulfilled");

  return {
    ...marketCache,
    fallbackUsed: staleUsed,
    partialFallback
  };
}

async function fetchKrwToVndRate() {
  const now = Date.now();
  if (Number.isFinite(fxCache.value) && now - fxCache.fetchedAt < FX_TTL_MS) {
    return {
      rate: fxCache.value,
      fetchedAt: fxCache.fetchedAt,
      fallbackUsed: false
    };
  }

  try {
    const payload = await fetchJson(FX_URL);
    const parsed = Number(payload?.rates?.VND);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("fx malformed");
    }

    fxCache = {
      value: parsed,
      fetchedAt: now
    };

    return {
      rate: fxCache.value,
      fetchedAt: fxCache.fetchedAt,
      fallbackUsed: false
    };
  } catch (error) {
    if (Number.isFinite(fxCache.value)) {
      return {
        rate: fxCache.value,
        fetchedAt: fxCache.fetchedAt,
        fallbackUsed: true
      };
    }
    throw error;
  }
}

function toVndPrice(valueKrw, krwToVndRate, krwToVndMultiplier) {
  if (
    !Number.isFinite(valueKrw) ||
    !Number.isFinite(krwToVndRate) ||
    !Number.isFinite(krwToVndMultiplier)
  ) {
    return null;
  }
  const converted = valueKrw * krwToVndRate * krwToVndMultiplier;
  if (!Number.isFinite(converted) || converted <= 0) return null;
  return Math.round(converted);
}

function resolveMarketChange(server, marketChanges) {
  const serverName = normalizeServerName(server.serverNameKr);
  const gamebitValue = Number(marketChanges.gamebitByOpt1?.[server.opt1]);
  const adreamerValue = Number(marketChanges.adreamerByServer?.[serverName]);
  const marketChangePct = Number.isFinite(gamebitValue)
    ? gamebitValue
    : Number.isFinite(adreamerValue)
      ? adreamerValue
      : null;

  return Number.isFinite(marketChangePct) ? Number(marketChangePct.toFixed(2)) : null;
}

function parsePositive(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function fetchAdreamerRateMap() {
  const now = Date.now();
  if (Object.keys(adreamerRateCache.byServer).length && now - adreamerRateCache.fetchedAt < ADREAMER_RATE_TTL_MS) {
    return adreamerRateCache.byServer;
  }

  const payload = await fetchJson(ADREAMER_ADENA_URL);
  if (!Array.isArray(payload)) {
    throw new Error("adreamer rate malformed");
  }

  const byServer = {};
  for (const item of payload) {
    const serverName = normalizeServerName(String(item?.server || "").trim());
    if (!serverName) continue;

    const avgPrice = parsePositive(item?.avgPrice);
    const barotemAvg = parsePositive(item?.barotemAvg);
    const itemmaniaAvg = parsePositive(item?.itemmaniaAvg);
    const change = Number(item?.change);

    byServer[serverName] = {
      avgPrice,
      barotemAvg,
      itemmaniaAvg,
      change: Number.isFinite(change) ? change : null,
      lastUpdated: typeof item?.lastUpdated === "string" ? item.lastUpdated : null
    };
  }

  adreamerRateCache = {
    byServer,
    fetchedAt: now
  };

  return byServer;
}

function applyAdreamerRateFallback(
  rows,
  modeKey,
  adreamerRateByServer,
  krwToVndRate,
  deductionProfiles
) {
  if (!Array.isArray(rows) || !rows.length || !adreamerRateByServer || typeof adreamerRateByServer !== "object") {
    return;
  }

  for (const row of rows) {
    if (row?.hasData && Number.isFinite(row?.ratePer10kVnd)) continue;
    const serverName = normalizeServerName(String(row?.serverNameKr || "").trim());
    if (!serverName) continue;

    const source = adreamerRateByServer[serverName];
    if (!source) continue;

    const preferredKrw =
      modeKey === "fast"
        ? parsePositive(source.itemmaniaAvg) || parsePositive(source.avgPrice) || parsePositive(source.barotemAvg)
        : parsePositive(source.barotemAvg) || parsePositive(source.avgPrice) || parsePositive(source.itemmaniaAvg);

    if (modeKey === "fast") {
      const fastRate = toVndPrice(preferredKrw, krwToVndRate, deductionProfiles.fast.multiplier);
      if (!Number.isFinite(fastRate)) continue;
      row.hasData = true;
      row.ratePer10kVnd = fastRate;
      row.ratePer10kVndFast = fastRate;
    } else {
      const slowLt1mRate = toVndPrice(preferredKrw, krwToVndRate, deductionProfiles.lt1m.multiplier);
      const slowGt1mRate = toVndPrice(preferredKrw, krwToVndRate, deductionProfiles.gt1m.multiplier);
      if (!Number.isFinite(slowLt1mRate) && !Number.isFinite(slowGt1mRate)) continue;
      row.hasData = Number.isFinite(slowLt1mRate) || Number.isFinite(slowGt1mRate);
      row.ratePer10kVnd = Number.isFinite(slowLt1mRate) ? slowLt1mRate : slowGt1mRate;
      row.ratePer10kVndLt1m = Number.isFinite(slowLt1mRate) ? slowLt1mRate : null;
      row.ratePer10kVndGt1m = Number.isFinite(slowGt1mRate) ? slowGt1mRate : null;
    }

    if (modeKey === "slow") {
      if (!row.crossRuleStatus || row.crossRuleStatus === "no_slow_data") {
        row.crossRuleStatus = "no_fast_data";
      }
      if (!Number.isFinite(row.skippedSlowCount)) {
        row.skippedSlowCount = 0;
      }
      if (!Number.isFinite(row.fastRefRatePer10kVnd)) {
        row.fastRefRatePer10kVnd = null;
      }
    }
  }
}

function buildModesFromCandidates({
  slowCandidatesByServer,
  fastCandidatesByServer,
  marketChanges,
  krwToVndRate,
  deductionProfiles
}) {
  const slowRows = [];
  const fastRows = [];
  const notes = {
    crossRuleFallback: []
  };

  for (const server of SERVER_ORDER) {
    const normalizedName = normalizeServerName(server.serverNameKr);
    const slowCandidates = slowCandidatesByServer?.get(normalizedName) || [];
    const fastCandidates = fastCandidatesByServer?.get(normalizedName) || [];

    const fastSelected = selectFastCandidate(fastCandidates);
    const slowSelected = selectSlowCandidate(slowCandidates, fastSelected);

    const fastRatePer10kVnd = fastSelected
      ? toVndPrice(fastSelected.ratePer10kKrw, krwToVndRate, deductionProfiles.fast.multiplier)
      : null;

    const slowRatePer10kVndLt1m = slowSelected.candidate
      ? toVndPrice(slowSelected.candidate.ratePer10kKrw, krwToVndRate, deductionProfiles.lt1m.multiplier)
      : null;
    const slowRatePer10kVndGt1m = slowSelected.candidate
      ? toVndPrice(slowSelected.candidate.ratePer10kKrw, krwToVndRate, deductionProfiles.gt1m.multiplier)
      : null;
    const slowRatePer10kVnd = Number.isFinite(slowRatePer10kVndLt1m)
      ? slowRatePer10kVndLt1m
      : slowRatePer10kVndGt1m;

    const marketChangePct = resolveMarketChange(server, marketChanges);

    fastRows.push({
      serverCode: server.serverCode,
      order: server.order,
      serverNameKr: server.serverNameKr,
      opt1: server.opt1,
      hasData: Boolean(fastSelected),
      ratePer10kVnd: fastRatePer10kVnd,
      ratePer10kVndFast: fastRatePer10kVnd,
      marketChangePct
    });

    slowRows.push({
      serverCode: server.serverCode,
      order: server.order,
      serverNameKr: server.serverNameKr,
      opt1: server.opt1,
      hasData: Boolean(slowSelected.candidate),
      ratePer10kVnd: slowRatePer10kVnd,
      ratePer10kVndLt1m: Number.isFinite(slowRatePer10kVndLt1m) ? slowRatePer10kVndLt1m : null,
      ratePer10kVndGt1m: Number.isFinite(slowRatePer10kVndGt1m) ? slowRatePer10kVndGt1m : null,
      marketChangePct,
      crossRuleStatus: slowSelected.crossRuleStatus,
      skippedSlowCount: slowSelected.skippedSlowCount,
      fastRefRatePer10kVnd: fastRatePer10kVnd,
      fastRefRatePer10kVndFast: fastRatePer10kVnd
    });

    if (
      slowSelected.crossRuleStatus === "fallback_below_fast" &&
      Number.isFinite(slowRatePer10kVnd) &&
      Number.isFinite(fastRatePer10kVnd)
    ) {
      notes.crossRuleFallback.push({
        serverCode: server.serverCode,
        serverNameKr: server.serverNameKr,
        opt1: server.opt1,
        slowRatePer10kVnd,
        fastRefRatePer10kVnd: fastRatePer10kVnd,
        skippedSlowCount: slowSelected.skippedSlowCount
      });
    }
  }

  return {
    slowRows,
    fastRows,
    notes
  };
}

function buildEmptyMode(modeKey) {
  return {
    key: modeKey,
    rows: SERVER_ORDER.map((server) => ({
      serverCode: server.serverCode,
      order: server.order,
      serverNameKr: server.serverNameKr,
      opt1: server.opt1,
      hasData: false,
      ratePer10kVnd: null,
      ...(modeKey === "slow"
        ? {
            ratePer10kVndLt1m: null,
            ratePer10kVndGt1m: null
          }
        : {
            ratePer10kVndFast: null
          }),
      marketChangePct: null,
      ...(modeKey === "slow"
        ? {
          crossRuleStatus: "no_slow_data",
          skippedSlowCount: 0,
          fastRefRatePer10kVnd: null,
          fastRefRatePer10kVndFast: null
        }
        : {})
    }))
  };
}

function buildPayload({
  isStale,
  slowMode,
  fastMode,
  notes,
  fxRate,
  fxUpdatedAt,
  deductionProfiles
}) {
  const profiles = normalizeProfiles(deductionProfiles);
  return {
    source: {
      provider: "market-feed",
      category: "2382r902",
      display: 2,
      filterOption: "거래가능물품 (value=2)",
      currency: "VND",
      exchange: {
        base: "KRW",
        quote: "VND",
        provider: "fx-feed",
        rate: Number.isFinite(fxRate) ? Number(fxRate.toFixed(6)) : null,
        deductionPercent: Number.isFinite(profiles.lt1m.deductionPercent)
          ? Number(profiles.lt1m.deductionPercent.toFixed(2))
          : null,
        multiplier: Number.isFinite(profiles.lt1m.multiplier)
          ? Number(profiles.lt1m.multiplier.toFixed(6))
          : null,
        deductionProfiles: {
          lt1m: {
            deductionPercent: Number.isFinite(profiles.lt1m.deductionPercent)
              ? Number(profiles.lt1m.deductionPercent.toFixed(2))
              : null,
            multiplier: Number.isFinite(profiles.lt1m.multiplier)
              ? Number(profiles.lt1m.multiplier.toFixed(6))
              : null
          },
          gt1m: {
            deductionPercent: Number.isFinite(profiles.gt1m.deductionPercent)
              ? Number(profiles.gt1m.deductionPercent.toFixed(2))
              : null,
            multiplier: Number.isFinite(profiles.gt1m.multiplier)
              ? Number(profiles.gt1m.multiplier.toFixed(6))
              : null
          },
          fast: {
            deductionPercent: Number.isFinite(profiles.fast.deductionPercent)
              ? Number(profiles.fast.deductionPercent.toFixed(2))
              : null,
            multiplier: Number.isFinite(profiles.fast.multiplier)
              ? Number(profiles.fast.multiplier.toFixed(6))
              : null
          }
        },
        updatedAt:
          Number.isFinite(fxUpdatedAt) && fxUpdatedAt > 0
            ? new Date(fxUpdatedAt).toISOString()
            : null
      },
      marketChange: {
        primary: "primary-feed",
        fallback: "backup-feed"
      },
      crossRule: {
        slowPrimary: "lowest slow >= fast",
        slowFallback: "allow lowest slow < fast when no match",
        fastPrimary: "highest fast after outlier filter",
        outlierMethod: "IQR + percentile"
      },
      modes: {
        slow: {
          sell: MODE_CONFIG.slow.sell,
          orderby: Number(MODE_CONFIG.slow.orderby),
          orderLabel: MODE_CONFIG.slow.orderLabel
        },
        fast: {
          sell: MODE_CONFIG.fast.sell,
          orderby: Number(MODE_CONFIG.fast.orderby),
          orderLabel: MODE_CONFIG.fast.orderLabel
        }
      }
    },
    dataUpdatedAt: new Date().toISOString(),
    isStale: Boolean(isStale),
    modes: {
      slow: slowMode,
      fast: fastMode
    },
    notes: {
      crossRuleFallback: Array.isArray(notes?.crossRuleFallback) ? notes.crossRuleFallback : []
    }
  };
}

async function settleWithStatus(promise) {
  try {
    return {
      status: "fulfilled",
      value: await promise
    };
  } catch (error) {
    return {
      status: "rejected",
      reason: error
    };
  }
}

async function refreshSnapshot(deductionProfiles) {
  const sidecarPromise = Promise.allSettled([
    withTimeout(fetchMarketChanges(), MARKET_FETCH_TIMEOUT_MS, "market timeout"),
    withTimeout(fetchKrwToVndRate(), FX_FETCH_TIMEOUT_MS, "fx timeout"),
    withTimeout(fetchAdreamerRateMap(), MARKET_FETCH_TIMEOUT_MS, "adreamer rate timeout")
  ]);

  const slowResult = await settleWithStatus(
    withTimeout(fetchModeCandidates(MODE_CONFIG.slow), MODE_FETCH_TIMEOUT_MS, "slow mode timeout")
  );

  if (MODE_FETCH_SPACING_MS > 0) {
    await sleep(MODE_FETCH_SPACING_MS);
  }

  const fastResult = await settleWithStatus(
    withTimeout(fetchModeCandidates(MODE_CONFIG.fast), MODE_FETCH_TIMEOUT_MS, "fast mode timeout")
  );

  const [marketResult, fxResult, adreamerRateResult] = await sidecarPromise;

  if (fxResult.status !== "fulfilled") {
    throw fxResult.reason;
  }

  const fxData = fxResult.value;
  const marketData =
    marketResult.status === "fulfilled"
      ? marketResult.value
      : {
          gamebitByOpt1: marketCache.gamebitByOpt1,
          adreamerByServer: marketCache.adreamerByServer,
          fallbackUsed: true
        };

  const slowCandidatesByServer = slowResult.status === "fulfilled" ? slowResult.value : null;
  const fastCandidatesByServer = fastResult.status === "fulfilled" ? fastResult.value : null;

  if (!slowCandidatesByServer && !fastCandidatesByServer) {
    throw new Error("unable to fetch both slow and fast mode");
  }

  const composed = buildModesFromCandidates({
    slowCandidatesByServer,
    fastCandidatesByServer,
    marketChanges: marketData,
    krwToVndRate: fxData.rate,
    deductionProfiles
  });

  const adreamerRateByServer =
    adreamerRateResult.status === "fulfilled" ? adreamerRateResult.value : adreamerRateCache.byServer;

  applyAdreamerRateFallback(
    composed.slowRows,
    "slow",
    adreamerRateByServer,
    fxData.rate,
    deductionProfiles
  );
  applyAdreamerRateFallback(
    composed.fastRows,
    "fast",
    adreamerRateByServer,
    fxData.rate,
    deductionProfiles
  );

  for (const row of composed.slowRows) {
    if (Number.isFinite(row.fastRefRatePer10kVnd)) continue;
    const fastRow = composed.fastRows.find((item) => item.serverCode === row.serverCode);
    row.fastRefRatePer10kVnd = Number.isFinite(fastRow?.ratePer10kVnd) ? Number(fastRow.ratePer10kVnd) : null;
    row.fastRefRatePer10kVndFast = Number.isFinite(fastRow?.ratePer10kVndFast)
      ? Number(fastRow.ratePer10kVndFast)
      : row.fastRefRatePer10kVnd;
    if (row.crossRuleStatus === "no_fast_data" && Number.isFinite(row.fastRefRatePer10kVnd)) {
      row.crossRuleStatus = "matched";
    }
  }

  const slowDataCount = composed.slowRows.filter((row) => row.hasData && Number.isFinite(row.ratePer10kVnd)).length;
  const fastDataCount = composed.fastRows.filter((row) => row.hasData && Number.isFinite(row.ratePer10kVnd)).length;
  const hasFullCoverage = slowDataCount >= SERVER_ORDER.length && fastDataCount >= SERVER_ORDER.length;

  let isStale = false;
  if (!hasFullCoverage) isStale = true;
  if (marketResult.status !== "fulfilled" && Object.keys(marketData.adreamerByServer || {}).length === 0) {
    isStale = true;
  }
  if (marketData.fallbackUsed || fxData.fallbackUsed) isStale = true;

  const payload = buildPayload({
    isStale,
    slowMode: {
      key: "slow",
      rows: composed.slowRows
    },
    fastMode: {
      key: "fast",
      rows: composed.fastRows
    },
    notes: composed.notes,
    fxRate: fxData.rate,
    fxUpdatedAt: fxData.fetchedAt,
    deductionProfiles
  });

  const latestProfiles = getDeductionProfiles();
  if (hasProfilesChanged(deductionProfiles, latestProfiles)) {
    return payload;
  }

  lastSnapshot = payload;
  lastSnapshotAt = Date.now();
  lastSnapshotProfiles = normalizeProfiles(deductionProfiles);
  persistSnapshot(payload, lastSnapshotProfiles);
  return payload;
}

const restored = restoreSnapshotFromDisk();
if (restored?.snapshot) {
  lastSnapshot = restored.snapshot;
  lastSnapshotProfiles = normalizeProfiles(
    restored.snapshotProfiles || getSnapshotProfiles(restored.snapshot, null)
  );
  lastSnapshotAt = 0;
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    if (typeof res?.status === "function") {
      res.status(204);
    }
    if (typeof res?.end === "function") {
      res.end();
      return;
    }
    if (typeof res?.json === "function") {
      res.json({});
      return;
    }
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const activeProfiles = normalizeProfiles(getDeductionProfiles());
  let profilesChanged = false;
  if (lastSnapshot && hasProfilesChanged(lastSnapshotProfiles, activeProfiles)) {
    lastSnapshot = scaleSnapshotForNewProfiles(lastSnapshot, activeProfiles, lastSnapshotProfiles);
    lastSnapshotAt = Date.now();
    lastSnapshotProfiles = activeProfiles;
    refreshPromise = null;
    profilesChanged = true;
  }

  if (profilesChanged && lastSnapshot) {
    if (!refreshPromise) {
      refreshPromise = refreshSnapshot(activeProfiles)
        .catch(() => null)
        .finally(() => {
          refreshPromise = null;
        });
    }

    res.status(200).json({
      ...lastSnapshot,
      isStale: true
    });
    return;
  }

  const now = Date.now();
  if (lastSnapshot && now - lastSnapshotAt < CACHE_TTL_MS) {
    res.status(200).json(lastSnapshot);
    return;
  }

  if (lastSnapshot) {
    if (!refreshPromise) {
      refreshPromise = refreshSnapshot(activeProfiles)
        .catch(() => null)
        .finally(() => {
          refreshPromise = null;
        });
    }

    res.status(200).json({
      ...lastSnapshot,
      isStale: true
    });
    return;
  }

  if (!refreshPromise) {
    refreshPromise = refreshSnapshot(activeProfiles).finally(() => {
      refreshPromise = null;
    });
  }

  try {
    const payload = await waitForPromiseOrNull(refreshPromise, INITIAL_RESPONSE_WAIT_MS);
    if (payload) {
      res.status(200).json(payload);
      return;
    }

    const startupFallbackPayload = buildPayload({
      isStale: true,
      slowMode: buildEmptyMode("slow"),
      fastMode: buildEmptyMode("fast"),
      notes: {
        crossRuleFallback: []
      },
      fxRate: fxCache.value,
      fxUpdatedAt: fxCache.fetchedAt,
      deductionProfiles: activeProfiles
    });

    res.status(200).json(startupFallbackPayload);
  } catch {
    if (lastSnapshot) {
      res.status(200).json({
        ...lastSnapshot,
        isStale: true
      });
      return;
    }

    const fallbackPayload = buildPayload({
      isStale: true,
      slowMode: buildEmptyMode("slow"),
      fastMode: buildEmptyMode("fast"),
      notes: {
        crossRuleFallback: []
      },
      fxRate: fxCache.value,
      fxUpdatedAt: fxCache.fetchedAt,
      deductionProfiles: activeProfiles
    });

    lastSnapshot = fallbackPayload;
    lastSnapshotAt = Date.now();
    lastSnapshotProfiles = activeProfiles;
    res.status(200).json(fallbackPayload);
  }
};
