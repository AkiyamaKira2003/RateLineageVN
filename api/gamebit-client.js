const DEFAULT_GAMEBIT_RELAY_BASES = ["https://r.jina.ai/http://"];
const GAMEBIT_FETCH_TIMEOUT_MS = Number(process.env.GAMEBIT_FETCH_TIMEOUT_MS || 8500);
const GAMEBIT_RELAY_FIRST = String(process.env.GAMEBIT_RELAY_FIRST || "1").toLowerCase() !== "0";

const GAMEBIT_HEADERS = {
  Accept: "application/json,text/plain,*/*",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Referer: "https://gamebit.co.kr/",
  Origin: "https://gamebit.co.kr",
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache"
};

function parseRelayBases() {
  const raw = String(
    process.env.GAMEBIT_RELAY_BASES || process.env.GAMEBIT_RELAY_BASE || ""
  ).trim();
  if (!raw) return [...DEFAULT_GAMEBIT_RELAY_BASES];
  if (["off", "none", "-", "0", "false"].includes(raw.toLowerCase())) {
    return [];
  }

  const parsed = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length ? parsed : [...DEFAULT_GAMEBIT_RELAY_BASES];
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

async function fetchJson(url, headers) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GAMEBIT_FETCH_TIMEOUT_MS);
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
      throw new Error(`timeout ${GAMEBIT_FETCH_TIMEOUT_MS}ms (${url})`);
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

async function fetchJsonViaRelay(targetUrl, relayBase) {
  const relayUrl = buildRelayUrl(relayBase, targetUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GAMEBIT_FETCH_TIMEOUT_MS);
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
      throw new Error(`relay timeout ${GAMEBIT_FETCH_TIMEOUT_MS}ms (${relayUrl})`);
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

async function fetchGamebitJson(targetUrl) {
  const relays = parseRelayBases();
  let lastError = null;

  async function tryRelays() {
    for (const relayBase of relays) {
      try {
        return await fetchJsonViaRelay(targetUrl, relayBase);
      } catch (relayError) {
        lastError = relayError;
      }
    }
    return null;
  }

  if (GAMEBIT_RELAY_FIRST) {
    const relayPayload = await tryRelays();
    if (relayPayload) return relayPayload;
  }

  try {
    return await fetchJson(targetUrl, GAMEBIT_HEADERS);
  } catch (directError) {
    lastError = directError;
  }

  if (!GAMEBIT_RELAY_FIRST) {
    const relayPayload = await tryRelays();
    if (relayPayload) return relayPayload;
  }

  throw lastError || new Error("gamebit fetch failed");
}

module.exports = {
  GAMEBIT_HEADERS,
  fetchGamebitJson
};
