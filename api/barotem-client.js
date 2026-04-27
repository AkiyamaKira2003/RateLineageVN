const DEFAULT_BAROTEM_RELAY_BASES = ["https://r.jina.ai/http://"];
const BAROTEM_FETCH_TIMEOUT_MS = Number(process.env.BAROTEM_FETCH_TIMEOUT_MS || 8500);
const BAROTEM_SESSION_TTL_MS = Number(process.env.BAROTEM_SESSION_TTL_MS || 5 * 60 * 1000);

let sessionCache = {
  cookieHeader: "",
  fetchedAt: 0,
  refererUrl: ""
};

function parseRelayBases() {
  const raw = String(
    process.env.BAROTEM_RELAY_BASES || process.env.BAROTEM_RELAY_BASE || ""
  ).trim();
  if (!raw) return [...DEFAULT_BAROTEM_RELAY_BASES];
  if (["off", "none", "-", "0", "false"].includes(raw.toLowerCase())) {
    return [];
  }

  const parsed = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length ? parsed : [...DEFAULT_BAROTEM_RELAY_BASES];
}

function buildRelayUrl(base, targetUrl) {
  if (!base) return targetUrl;
  if (base.includes("{url}")) {
    return base.replace("{url}", encodeURIComponent(targetUrl));
  }

  if (base.endsWith("http://") || base.endsWith("https://")) {
    return `${base}${String(targetUrl).replace(/^https?:\/\//, "")}`;
  }

  if (base.endsWith("/")) {
    return `${base}${encodeURIComponent(targetUrl)}`;
  }

  return `${base}${encodeURIComponent(targetUrl)}`;
}

function normalizeRelayText(rawText) {
  if (typeof rawText !== "string") return "";
  let text = rawText.trim();

  const marker = "Markdown Content:";
  const markerIndex = text.indexOf(marker);
  if (markerIndex >= 0) {
    text = text.slice(markerIndex + marker.length).trim();
  }

  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\s*/, "");
    text = text.replace(/\s*```$/, "");
    text = text.trim();
  }

  const objectStart = text.indexOf("{");
  const arrayStart = text.indexOf("[");
  let jsonStart = -1;
  if (objectStart >= 0 && arrayStart >= 0) jsonStart = Math.min(objectStart, arrayStart);
  else jsonStart = Math.max(objectStart, arrayStart);

  if (jsonStart > 0) {
    text = text.slice(jsonStart).trim();
  }

  return text;
}

function extractJsonSlice(text) {
  if (typeof text !== "string") return "";
  const startObj = text.indexOf("{");
  const startArr = text.indexOf("[");
  let start = -1;

  if (startObj >= 0 && startArr >= 0) start = Math.min(startObj, startArr);
  else start = Math.max(startObj, startArr);
  if (start < 0) return "";

  const open = text[start];
  const close = open === "{" ? "}" : "]";

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];

    if (inString) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (ch === "\\") {
        escaping = true;
        continue;
      }
      if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
      continue;
    }

    if (ch === open) {
      depth += 1;
      continue;
    }

    if (ch === close) {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return text.slice(start).trim();
}

function buildBarotemHeaders(refererUrl) {
  const headers = {
    Accept: "application/json,text/plain,*/*",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    Referer: refererUrl
  };

  try {
    const parsed = new URL(refererUrl);
    headers.Origin = parsed.origin;
  } catch {
    // Ignore invalid referer URL.
  }

  return headers;
}

function buildBarotemPageHeaders(refererUrl) {
  return {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    Referer: refererUrl
  };
}

function extractSetCookies(response) {
  if (!response?.headers) return [];
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }

  const single = response.headers.get("set-cookie");
  return single ? [single] : [];
}

function buildCookieHeader(setCookieValues) {
  if (!Array.isArray(setCookieValues) || !setCookieValues.length) return "";

  const cookieMap = new Map();

  for (const item of setCookieValues) {
    if (typeof item !== "string") continue;
    const firstPart = item.split(";")[0]?.trim();
    if (!firstPart || !firstPart.includes("=")) continue;
    const [name, ...rest] = firstPart.split("=");
    if (!name || !rest.length) continue;
    cookieMap.set(name.trim(), `${name.trim()}=${rest.join("=").trim()}`);
  }

  return Array.from(cookieMap.values()).join("; ");
}

function isInvalidBarotemPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
  if (!Object.prototype.hasOwnProperty.call(payload, "code")) return false;
  return Number(payload.code) !== 200;
}

async function fetchResponse(url, headers) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BAROTEM_FETCH_TIMEOUT_MS);
  let response = null;
  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`timeout ${BAROTEM_FETCH_TIMEOUT_MS}ms (${url})`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`http ${response.status} (${url})`);
  }

  return response;
}

async function fetchBarotemSessionCookie(refererUrl, forceRefresh) {
  const now = Date.now();
  if (
    !forceRefresh &&
    sessionCache.cookieHeader &&
    now - sessionCache.fetchedAt < BAROTEM_SESSION_TTL_MS &&
    sessionCache.refererUrl === refererUrl
  ) {
    return sessionCache.cookieHeader;
  }

  const response = await fetchResponse(refererUrl, buildBarotemPageHeaders(refererUrl));
  const cookieHeader = buildCookieHeader(extractSetCookies(response));
  if (!cookieHeader) {
    throw new Error("barotem session cookie missing");
  }

  sessionCache = {
    cookieHeader,
    fetchedAt: now,
    refererUrl
  };

  return cookieHeader;
}

async function fetchBarotemDirect(targetUrl, refererUrl, cookieHeader) {
  const headers = buildBarotemHeaders(refererUrl);
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const response = await fetchResponse(targetUrl, headers);
  const payload = await response.json();
  if (isInvalidBarotemPayload(payload)) {
    throw new Error(`barotem payload code ${payload.code}`);
  }

  return payload;
}

async function fetchJson(url, headers) {
  const response = await fetchResponse(
    url,
    headers || {
      Accept: "application/json,text/plain,*/*"
    }
  );
  return response.json();
}

async function fetchJsonViaRelay(targetUrl, relayBase) {
  const relayUrl = buildRelayUrl(relayBase, targetUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BAROTEM_FETCH_TIMEOUT_MS);
  let response = null;
  try {
    response = await fetch(relayUrl, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "text/plain,*/*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      }
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`relay timeout ${BAROTEM_FETCH_TIMEOUT_MS}ms (${relayUrl})`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`relay http ${response.status} (${relayUrl})`);
  }

  const text = normalizeRelayText(await response.text());
  const jsonText = extractJsonSlice(text);
  if (!jsonText) {
    throw new Error(`relay payload missing json (${relayUrl})`);
  }
  return JSON.parse(jsonText);
}

async function fetchBarotemJson(targetUrl, refererUrl) {
  try {
    return await fetchBarotemDirect(targetUrl, refererUrl, "");
  } catch (directError) {
    let lastError = directError;

    try {
      const cookieHeader = await fetchBarotemSessionCookie(refererUrl, false);
      return await fetchBarotemDirect(targetUrl, refererUrl, cookieHeader);
    } catch (sessionError) {
      lastError = sessionError;
    }

    try {
      const cookieHeader = await fetchBarotemSessionCookie(refererUrl, true);
      return await fetchBarotemDirect(targetUrl, refererUrl, cookieHeader);
    } catch (refreshSessionError) {
      lastError = refreshSessionError;
    }

    const relays = parseRelayBases();

    for (const relayBase of relays) {
      try {
        const relayPayload = await fetchJsonViaRelay(targetUrl, relayBase);
        if (isInvalidBarotemPayload(relayPayload)) {
          lastError = new Error(`barotem relay payload code ${relayPayload.code}`);
          continue;
        }
        return relayPayload;
      } catch (relayError) {
        lastError = relayError;
      }
    }

    throw lastError;
  }
}

module.exports = {
  fetchBarotemJson
};
