const fs = require("fs");

const DEFAULT_DEDUCTION_PERCENT_LT1M = 19;
const DEFAULT_DEDUCTION_PERCENT_GT1M = 15;
const DEFAULT_DEDUCTION_PERCENT_FAST = 19;

const DEDUCTION_ENV_KEYS = {
  lt1m: "RATELINEAGE_DEDUCTION_PERCENT_LT1M",
  gt1m: "RATELINEAGE_DEDUCTION_PERCENT_GT1M",
  fast: "RATELINEAGE_DEDUCTION_PERCENT_FAST"
};

const LEGACY_DEDUCTION_ENV_KEY = "RATELINEAGE_DEDUCTION_PERCENT";

const DEFAULT_KEYS = {
  lt1m: "DEFAULT_DEDUCTION_PERCENT_LT1M",
  gt1m: "DEFAULT_DEDUCTION_PERCENT_GT1M",
  fast: "DEFAULT_DEDUCTION_PERCENT_FAST"
};

let defaultPercentCache = {
  mtimeMs: 0,
  values: {
    lt1m: DEFAULT_DEDUCTION_PERCENT_LT1M,
    gt1m: DEFAULT_DEDUCTION_PERCENT_GT1M,
    fast: DEFAULT_DEDUCTION_PERCENT_FAST
  }
};

function normalizeDeductionPercent(value, fallbackValue) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallbackValue;
  if (parsed < 0) return 0;
  if (parsed >= 100) return 99;
  return parsed;
}

function parseDefaultByName(source, constantName, fallbackValue) {
  const regex = new RegExp(`${constantName}\\s*=\\s*([0-9]+(?:\\.[0-9]+)?)`);
  const matched = source.match(regex);
  const parsed = matched ? Number(matched[1]) : fallbackValue;
  return normalizeDeductionPercent(parsed, fallbackValue);
}

function readDefaultDeductionPercentsFromFile() {
  try {
    const stat = fs.statSync(__filename);
    const mtimeMs = Number(stat?.mtimeMs || 0);
    if (mtimeMs > 0 && mtimeMs === defaultPercentCache.mtimeMs) {
      return defaultPercentCache.values;
    }

    const source = fs.readFileSync(__filename, "utf8");
    const values = {
      lt1m: parseDefaultByName(source, DEFAULT_KEYS.lt1m, DEFAULT_DEDUCTION_PERCENT_LT1M),
      gt1m: parseDefaultByName(source, DEFAULT_KEYS.gt1m, DEFAULT_DEDUCTION_PERCENT_GT1M),
      fast: parseDefaultByName(source, DEFAULT_KEYS.fast, DEFAULT_DEDUCTION_PERCENT_FAST)
    };

    defaultPercentCache = {
      mtimeMs,
      values
    };
    return values;
  } catch {
    return defaultPercentCache.values;
  }
}

function resolveRawDeductionValues(defaultValues) {
  const legacy = process.env[LEGACY_DEDUCTION_ENV_KEY];
  return {
    lt1m: process.env[DEDUCTION_ENV_KEYS.lt1m] ?? legacy ?? defaultValues.lt1m,
    gt1m: process.env[DEDUCTION_ENV_KEYS.gt1m] ?? legacy ?? defaultValues.gt1m,
    fast: process.env[DEDUCTION_ENV_KEYS.fast] ?? legacy ?? defaultValues.fast
  };
}

function getDeductionProfiles() {
  const defaults = readDefaultDeductionPercentsFromFile();
  const rawValues = resolveRawDeductionValues(defaults);

  const lt1m = normalizeDeductionPercent(rawValues.lt1m, defaults.lt1m);
  const gt1m = normalizeDeductionPercent(rawValues.gt1m, defaults.gt1m);
  const fast = normalizeDeductionPercent(rawValues.fast, defaults.fast);

  return {
    lt1m: {
      deductionPercent: lt1m,
      multiplier: (100 - lt1m) / 100
    },
    gt1m: {
      deductionPercent: gt1m,
      multiplier: (100 - gt1m) / 100
    },
    fast: {
      deductionPercent: fast,
      multiplier: (100 - fast) / 100
    }
  };
}

function getDeductionPercent(kind = "lt1m") {
  const profiles = getDeductionProfiles();
  const key = kind in profiles ? kind : "lt1m";
  return profiles[key].deductionPercent;
}

function getKrwToVndMultiplier(kind = "lt1m") {
  const profiles = getDeductionProfiles();
  const key = kind in profiles ? kind : "lt1m";
  return profiles[key].multiplier;
}

function getPriceConfig() {
  return getDeductionProfiles();
}

module.exports = {
  DEFAULT_DEDUCTION_PERCENT_LT1M,
  DEFAULT_DEDUCTION_PERCENT_GT1M,
  DEFAULT_DEDUCTION_PERCENT_FAST,
  DEDUCTION_ENV_KEYS,
  LEGACY_DEDUCTION_ENV_KEY,
  getDeductionProfiles,
  getDeductionPercent,
  getKrwToVndMultiplier,
  getPriceConfig
};

