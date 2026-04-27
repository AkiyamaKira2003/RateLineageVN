const ADREAMER_HISTORY_URL = "https://game.adreamer.now/api/prices/adena";
const GAMEBIT_CHART_URL = "https://gamebit.co.kr/v3_get_chart_data.php";
const FX_URL = "https://open.er-api.com/v6/latest/KRW";

const CACHE_TTL_MS = Number(process.env.CHART_CACHE_TTL_MS || 60 * 1000);
const FX_TTL_MS = 10 * 60 * 1000;
const DELAY_THRESHOLD_MINUTES = 15;
const GAMEBIT_FETCH_RETRIES = 2;
const GAMEBIT_RETRY_DELAY_MS = 400;

const RANGE_CONFIG = {
  "24h": {
    adreamerRange: "24h",
    gamebitType: "min",
    windowMs: 24 * 60 * 60 * 1000
  },
  "7d": {
    adreamerRange: "7d",
    gamebitType: "min",
    windowMs: 7 * 24 * 60 * 60 * 1000
  },
  "30d": {
    adreamerRange: "30d",
    gamebitType: "day",
    windowMs: 30 * 24 * 60 * 60 * 1000
  }
};

const { findServerByCode } = require("./server-config");
const { getDeductionPercent, getKrwToVndMultiplier } = require("./price-config");
const { fetchGamebitJson } = require("./gamebit-client");
const MULTIPLIER_EPSILON = 1e-12;

let fxCache = {
  value: null,
  fetchedAt: 0
};

const chartCache = new Map();
let chartCacheMultiplier = null;

function setCorsHeaders(res) {
  if (typeof res?.setHeader !== "function") return;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function pickFirst(value, fallback) {
  if (Array.isArray(value)) return value[0] || fallback;
  if (typeof value === "string") return value;
  return fallback;
}

function parseTimeToUnix(value) {
  if (Number.isFinite(value)) {
    return value > 1e12 ? Math.floor(value / 1000) : Math.floor(value);
  }

  if (typeof value !== "string" || !value.trim()) return null;

  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) {
    return Math.floor(parsed / 1000);
  }

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateOnly) return null;
  const year = Number(dateOnly[1]);
  const month = Number(dateOnly[2]) - 1;
  const day = Number(dateOnly[3]);
  return Math.floor(Date.UTC(year, month, day) / 1000);
}

function filterByWindow(points, windowMs) {
  if (!Array.isArray(points) || !points.length) return [];
  const maxTime = points.reduce((acc, item) => Math.max(acc, item.time), 0);
  const minTime = maxTime - Math.floor(windowMs / 1000);
  return points
    .filter((item) => item.time >= minTime)
    .sort((a, b) => a.time - b.time);
}

function getLatestUnix(points) {
  if (!Array.isArray(points) || !points.length) return null;
  const latest = points.reduce((acc, point) => Math.max(acc, Number(point?.time) || 0), 0);
  return Number.isFinite(latest) && latest > 0 ? latest : null;
}

function computeFreshness(lines, candles, nowMs) {
  const market = Array.isArray(lines?.market) ? lines.market : [];
  const volatility = Array.isArray(candles?.volatility) ? candles.volatility : [];
  const latestMarketUnix = getLatestUnix(market);
  const latestVolatilityUnix = getLatestUnix(volatility);

  const candidates = [latestMarketUnix, latestVolatilityUnix].filter(
    (value) => Number.isFinite(value) && value > 0
  );
  if (!candidates.length) return null;

  const latestUnix = Math.max(...candidates);

  const latestMs = latestUnix * 1000;
  const lagMinutes = Math.max(0, Math.floor((nowMs - latestMs) / 60000));

  let source = "unknown";
  if (latestUnix === latestVolatilityUnix && latestUnix === latestMarketUnix) {
    source = "market+volatility";
  } else if (latestUnix === latestVolatilityUnix) {
    source = "volatility";
  } else if (latestUnix === latestMarketUnix) {
    source = "market";
  }

  return {
    latestPricePointAt: new Date(latestMs).toISOString(),
    lagMinutes,
    isDelayed: lagMinutes >= DELAY_THRESHOLD_MINUTES,
    thresholdMinutes: DELAY_THRESHOLD_MINUTES,
    source
  };
}

function hasMultiplierChanged(previousMultiplier, nextMultiplier) {
  if (!Number.isFinite(previousMultiplier) || !Number.isFinite(nextMultiplier)) return false;
  return Math.abs(previousMultiplier - nextMultiplier) > MULTIPLIER_EPSILON;
}

function scalePositiveValue(value, ratio) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  const scaled = Math.round(parsed * ratio);
  return Number.isFinite(scaled) && scaled > 0 ? scaled : null;
}

function getChartPayloadMultiplier(payload, fallbackMultiplier) {
  const fromPayload = Number(payload?.conversion?.multiplier);
  if (Number.isFinite(fromPayload) && fromPayload > 0) return fromPayload;
  if (Number.isFinite(fallbackMultiplier) && fallbackMultiplier > 0) return fallbackMultiplier;
  return null;
}

function scaleChartPayloadForNewMultiplier(payload, nextMultiplier, nextDeductionPercent, fallbackMultiplier) {
  if (!payload || !Number.isFinite(nextMultiplier) || nextMultiplier <= 0) return payload;
  const prevMultiplier = getChartPayloadMultiplier(payload, fallbackMultiplier);
  if (!Number.isFinite(prevMultiplier) || prevMultiplier <= 0) return payload;

  const ratio = nextMultiplier / prevMultiplier;
  const market = Array.isArray(payload?.lines?.market)
    ? payload.lines.market
        .map((point) => ({
          ...point,
          value: scalePositiveValue(point?.value, ratio)
        }))
        .filter((point) => Number.isFinite(point.value))
    : [];

  const volatility = Array.isArray(payload?.candles?.volatility)
    ? payload.candles.volatility
        .map((candle) => ({
          ...candle,
          open: scalePositiveValue(candle?.open, ratio),
          high: scalePositiveValue(candle?.high, ratio),
          low: scalePositiveValue(candle?.low, ratio),
          close: scalePositiveValue(candle?.close, ratio)
        }))
        .filter(
          (candle) =>
            [candle.open, candle.high, candle.low, candle.close].every(
              (value) => Number.isFinite(value) && value > 0
            )
        )
    : [];

  return {
    ...payload,
    updatedAt: new Date().toISOString(),
    isStale: true,
    conversion: {
      ...(payload?.conversion || {}),
      deductionPercent: Number.isFinite(nextDeductionPercent)
        ? Number(nextDeductionPercent.toFixed(2))
        : null,
      multiplier: Number(nextMultiplier.toFixed(6))
    },
    lines: {
      ...(payload?.lines || {}),
      market
    },
    candles: {
      ...(payload?.candles || {}),
      volatility
    },
    freshness: computeFreshness(
      {
        market
      },
      {
        volatility
      },
      Date.now()
    )
  };
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, headers) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: headers || {
      Accept: "application/json,text/plain,*/*"
    }
  });

  if (!response.ok) {
    throw new Error(`http ${response.status} (${url})`);
  }

  return response.json();
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

async function fetchAdreamerMarketLine(serverNameKr, rangeKey, krwToVndRate, krwToVndMultiplier) {
  const cfg = RANGE_CONFIG[rangeKey];
  const url = `${ADREAMER_HISTORY_URL}/${encodeURIComponent(serverNameKr)}/history?range=${cfg.adreamerRange}`;
  const payload = await fetchJson(url);

  if (!payload || !Array.isArray(payload.points)) {
    throw new Error("adreamer history malformed");
  }

  const market = [];

  for (const point of payload.points) {
    const time = parseTimeToUnix(point?.time);
    const marketKrw = Number(point?.barotem);

    if (!Number.isFinite(time) || !Number.isFinite(marketKrw) || marketKrw <= 0) continue;

    const marketVnd = toVndPrice(marketKrw, krwToVndRate, krwToVndMultiplier);
    if (!Number.isFinite(marketVnd)) continue;

    market.push({
      time,
      value: marketVnd
    });
  }

  return filterByWindow(market, cfg.windowMs);
}

async function fetchGamebitCandlesAndVolume(opt1, rangeKey, krwToVndRate, krwToVndMultiplier) {
  const cfg = RANGE_CONFIG[rangeKey];
  const url = `${GAMEBIT_CHART_URL}?game=aden&sid=${encodeURIComponent(opt1)}&type=${cfg.gamebitType}`;
  const payload = await fetchGamebitJson(url);

  if (!Array.isArray(payload)) {
    throw new Error("gamebit chart malformed");
  }

  const candles = [];
  const volume = [];

  for (const item of payload) {
    const time = parseTimeToUnix(item?.time);
    const openKrw = Number(item?.open);
    const highKrw = Number(item?.high);
    const lowKrw = Number(item?.low);
    const closeKrw = Number(item?.close);
    const volValue = Number(item?.volume);

    if (!Number.isFinite(time)) continue;

    const open = toVndPrice(openKrw, krwToVndRate, krwToVndMultiplier);
    const high = toVndPrice(highKrw, krwToVndRate, krwToVndMultiplier);
    const low = toVndPrice(lowKrw, krwToVndRate, krwToVndMultiplier);
    const close = toVndPrice(closeKrw, krwToVndRate, krwToVndMultiplier);

    if ([open, high, low, close].every((value) => Number.isFinite(value) && value > 0)) {
      candles.push({
        time,
        open,
        high,
        low,
        close
      });
    }

    if (Number.isFinite(volValue) && volValue >= 0 && Number.isFinite(open) && Number.isFinite(close)) {
      volume.push({
        time,
        value: volValue,
        isUp: close >= open
      });
    }
  }

  return {
    candles: filterByWindow(candles, cfg.windowMs),
    volume: filterByWindow(volume, cfg.windowMs)
  };
}

async function fetchGamebitCandlesAndVolumeWithRetry(
  opt1,
  rangeKey,
  krwToVndRate,
  krwToVndMultiplier
) {
  let lastError = null;
  for (let attempt = 0; attempt <= GAMEBIT_FETCH_RETRIES; attempt += 1) {
    try {
      return await fetchGamebitCandlesAndVolume(opt1, rangeKey, krwToVndRate, krwToVndMultiplier);
    } catch (error) {
      lastError = error;
      if (attempt >= GAMEBIT_FETCH_RETRIES) break;
      const jitter = Math.floor(Math.random() * 120);
      await sleep(GAMEBIT_RETRY_DELAY_MS * (attempt + 1) + jitter);
    }
  }
  throw lastError || new Error("gamebit chart fetch failed");
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

  const requestedServerCode = pickFirst(req.query?.serverCode, "S1");
  const requestedRange = pickFirst(req.query?.range, "24h");
  const server = findServerByCode(requestedServerCode) || findServerByCode("S1");
  const range = RANGE_CONFIG[requestedRange] ? requestedRange : "24h";
  const cacheKey = `${server.serverCode}:${range}`;
  const activeMultiplier = getKrwToVndMultiplier();
  const activeDeductionPercent = getDeductionPercent();

  if (hasMultiplierChanged(chartCacheMultiplier, activeMultiplier)) {
    const previousMultiplier = chartCacheMultiplier;
    for (const [key, entry] of chartCache.entries()) {
      if (!entry?.payload) continue;
      chartCache.set(key, {
        payload: scaleChartPayloadForNewMultiplier(
          entry.payload,
          activeMultiplier,
          activeDeductionPercent,
          previousMultiplier
        ),
        cachedAt: 0
      });
    }
  }
  chartCacheMultiplier = activeMultiplier;

  const now = Date.now();
  const cached = chartCache.get(cacheKey);
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    res.status(200).json(cached.payload);
    return;
  }

  try {
    const fxData = await fetchKrwToVndRate();

    const [marketResult, gamebitResult] = await Promise.allSettled([
      fetchAdreamerMarketLine(server.serverNameKr, range, fxData.rate, activeMultiplier),
      fetchGamebitCandlesAndVolumeWithRetry(server.opt1, range, fxData.rate, activeMultiplier)
    ]);

    if (marketResult.status !== "fulfilled" && gamebitResult.status !== "fulfilled") {
      throw new Error("both chart sources failed");
    }

    const marketLine = marketResult.status === "fulfilled" ? marketResult.value : [];
    const gamebit =
      gamebitResult.status === "fulfilled"
        ? gamebitResult.value
        : {
            candles: [],
            volume: []
          };

    const lines = {
      market: marketLine
    };

    const candles = {
      volatility: gamebit.candles
    };

    const volume = gamebit.volume;

    const hasAnySeries = lines.market.length || candles.volatility.length || volume.length;
    if (!hasAnySeries) {
      throw new Error("empty chart points");
    }

    const payload = {
      server: {
        serverCode: server.serverCode,
        serverNameKr: server.serverNameKr,
        opt1: server.opt1
      },
      range,
      currency: "VND",
      updatedAt: new Date(now).toISOString(),
      isStale: fxData.fallbackUsed || marketResult.status !== "fulfilled",
      conversion: {
        deductionPercent: Number.isFinite(activeDeductionPercent)
          ? Number(activeDeductionPercent.toFixed(2))
          : null,
        multiplier: Number.isFinite(activeMultiplier)
          ? Number(activeMultiplier.toFixed(6))
          : null
      },
      lines,
      candles,
      volume,
      freshness: computeFreshness(lines, candles, now)
    };

    chartCache.set(cacheKey, {
      payload,
      cachedAt: now
    });

    res.status(200).json(payload);
  } catch {
    if (cached) {
      res.status(200).json({
        ...cached.payload,
        isStale: true
      });
      return;
    }

    res.status(200).json({
      server: {
        serverCode: server.serverCode,
        serverNameKr: server.serverNameKr,
        opt1: server.opt1
      },
      range,
      currency: "VND",
      updatedAt: new Date().toISOString(),
      isStale: true,
      conversion: {
        deductionPercent: Number.isFinite(activeDeductionPercent)
          ? Number(activeDeductionPercent.toFixed(2))
          : null,
        multiplier: Number.isFinite(activeMultiplier)
          ? Number(activeMultiplier.toFixed(6))
          : null
      },
      lines: {
        market: []
      },
      candles: {
        volatility: []
      },
      volume: [],
      freshness: null
    });
  }
};
