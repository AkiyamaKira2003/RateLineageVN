const STORAGE_LANG_KEY = "rateline_lang";
const STORAGE_SERIES_VIS_KEY = "rateline_chart_series_visibility";
const STORAGE_LIST_LENGTH_KEY = "rateline_list_length_mode";
const STORAGE_EXPORT_SCALE_KEY = "rateline_export_image_scale";

const DEFAULT_LANG = "vi";
const DEFAULT_SERVER_CODE = "S1";
const DEFAULT_RANGE = "24h";
const ENABLE_CHART_HOVER = false;
const BOOT_LOADER_MIN_VISIBLE_MS = 650;
const SOURCE_GUARD_ENABLED = true;
const DEVTOOLS_GAP_THRESHOLD = 170;
const DEVTOOLS_SECONDARY_GAP_MAX = 140;
const DEVTOOLS_CHECK_MS = 1000;

const AUTO_REFRESH_RATES_MS = 15 * 60 * 1000;
const AUTO_REFRESH_CHART_MS = 30 * 1000;
const API_FETCH_TIMEOUT_MS = 12000;
const DEFAULT_DELAY_THRESHOLD_MINUTES = 15;
const RATE_GT_1M_BONUS_VND = 1000;
const CHART_RIGHT_SCALE_MIN_WIDTH = 96;
const DEFAULT_LIST_LENGTH_MODE = "medium";
const EXPORT_IMAGE_WIDTH = 1600;
const EXPORT_IMAGE_BASE_HEIGHT = 0;
const EXPORT_IMAGE_SCALE_DEFAULT = 4;
const EXPORT_IMAGE_SCALE_MIN = 1;
const EXPORT_IMAGE_SCALE_MAX = 16;
const EXPORT_IMAGE_SCALE_STEP = 0.25;
const SORT_KEY_SERVER = "server";
const SORT_KEY_RATE_LT1M = "rateLt1m";
const SORT_KEY_RATE_GT1M = "rateGt1m";
const SORT_KEY_FAST = "fast";
const SORT_KEY_CHANGE = "change";
const SORT_KEY_AVG = "avg";

const DEFAULT_SERIES_VISIBILITY = {
  market: true,
  volatility: true,
  volume: true
};
const LIST_LENGTH_MODES = new Set(["short", "medium", "full"]);

const LANG_TO_LOCALE = {
  vi: "vi-VN",
  ko: "ko-KR",
  en: "en-US"
};

const I18N = {
  vi: {
    title: "Kira Rate Adena VN Lineage Classic",
    subtitle: "Realtime 100% - Cập nhật 24/7",
    refresh: "Làm mới",
    listLenShort: "List ngắn",
    listLenMedium: "List vừa",
    listLenFull: "Toàn bộ",
    exportImage: "Xuất ảnh Full HD",
    exportImageWorking: "Đang xuất...",
    exportImageFailed: "Không thể xuất ảnh lúc này.",
    copyImage: "Copy ảnh Full HD",
    copyImageWorking: "Đang copy...",
    copyImageFailed: "Không thể copy ảnh vào clipboard.",
    copyImageUnsupported: "Trình duyệt hiện tại không hỗ trợ copy ảnh.",
    exportScaleLabel: "Scale",
    exportImageStamp: "Xuất lúc",
    exportImageServers: "Toàn bộ danh sách server",
    exportLt1m: "<1m Adena",
    exportGt1m: ">1m Adena",
    exportFast: "Bán nhanh",
    exportChange: "Biến động",
    searchPlaceholder: "Tìm kiếm (ví dụ: S1, S2, S3,... hoặc tên server)",
    updatedAt: "Cập nhật",
    liveSlow: "Bán treo (chậm)",
    liveFast: "Bán nhanh",
    liveMerged: "Bảng tổng hợp",
    countSlow: "Treo",
    countFast: "Nhanh",
    headServer: "Server",
    headName: "Tên server (KR)",
    headRateLt1m: "<1m Adena",
    headRateGt1m: ">1m Adena",
    headFastRate: "Bán nhanh",
    headChange: "Biến động %",
    stale: "Dữ liệu đang ở chế độ dự phòng (stale), hệ thống sẽ tự đồng bộ lại.",
    errLoad: "Không tải được dữ liệu giá. Vui lòng thử lại sau.",
    noData: "-",
    selectedServer: "Server",
    crossFallback: "Server fallback (slow < fast)",
    fallbackBadge: "Fallback",
    chartTitle: "Biểu đồ tổng hợp",
    chartSubtitle: "Dữ liệu thị trường realtime + nến giá + khối lượng giao dịch",
    dataTo: "Dữ liệu tới",
    chartDelay: "Trễ {minutes} phút",
    chartStale: "Dữ liệu biểu đồ đang ở chế độ dự phòng.",
    chartNoData: "Không có dữ liệu biểu đồ cho server/range này.",
    chartErr: "Không tải được biểu đồ. Giữ dữ liệu cũ nếu có.",
    chartLibMissing: "Thiếu thư viện chart, không thể render biểu đồ.",
    chartLoadingLive: "Đang tải biểu đồ...",
    loadingInit: "Đang khởi tạo giao diện",
    loadingRates: "Đang tải bảng giá",
    loadingChart: "Đang tải biểu đồ",
    loadingDone: "Đang hoàn tất",
    sourceGuardTitle: "Truy cập bị giới hạn",
    sourceGuardMessage: "Tính năng inspect/debugger đã bị vô hiệu hóa.",
    sourceGuardHint: "Đóng DevTools và tải lại trang để tiếp tục.",
    legendMarket: "Biến động giá thị trường",
    legendVolatility: "Sơ đồ biến động",
    legendVolume: "Khối lượng giao dịch",
    range24h: "24h",
    range7d: "7d",
    range30d: "30d",
    mobileSortAvg: "Sắp xếp TB Adena",
    mobileSortDefault: "Mặc định S1→S28"
  },
  ko: {
    title: "Kira Rate Adena VN Lineage Classic",
    subtitle: "Realtime 100% - 24/7 업데이트",
    refresh: "새로고침",
    listLenShort: "짧게 보기",
    listLenMedium: "보통 보기",
    listLenFull: "전체",
    exportImage: "Full HD 이미지 저장",
    exportImageWorking: "내보내는 중...",
    exportImageFailed: "지금은 이미지를 저장할 수 없습니다.",
    copyImage: "Full HD 이미지 복사",
    copyImageWorking: "복사 중...",
    copyImageFailed: "클립보드로 이미지를 복사할 수 없습니다.",
    copyImageUnsupported: "현재 브라우저는 이미지 복사를 지원하지 않습니다.",
    exportScaleLabel: "배율",
    exportImageStamp: "내보낸 시각",
    exportImageServers: "전체 서버 목록",
    exportLt1m: "<1m Adena",
    exportGt1m: ">1m Adena",
    exportFast: "Bán nhanh",
    exportChange: "변동",
    searchPlaceholder: "검색 (예: S1, S2, S3,... 또는 서버명)",
    updatedAt: "업데이트",
    liveSlow: "느린 판매",
    liveFast: "빠른 판매",
    liveMerged: "통합 표",
    countSlow: "느림",
    countFast: "빠름",
    headServer: "서버",
    headName: "서버명 (KR)",
    headRateLt1m: "<1m Adena",
    headRateGt1m: ">1m Adena",
    headFastRate: "Bán nhanh",
    headChange: "변동률 %",
    stale: "데이터가 stale 상태입니다. 자동으로 다시 동기화됩니다.",
    errLoad: "시세 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    noData: "-",
    selectedServer: "서버",
    crossFallback: "Fallback 서버 (slow < fast)",
    fallbackBadge: "Fallback",
    chartTitle: "통합 차트",
    chartSubtitle: "실시간 시장 데이터 + 가격 캔들 + 거래량",
    dataTo: "데이터 기준",
    chartDelay: "{minutes}분 지연",
    chartStale: "차트 데이터가 stale 상태입니다.",
    chartNoData: "선택한 서버/구간의 차트 데이터가 없습니다.",
    chartErr: "차트 로드에 실패했습니다. 기존 데이터가 있으면 유지합니다.",
    chartLibMissing: "차트 라이브러리가 없어 렌더링할 수 없습니다.",
    chartLoadingLive: "차트 로딩 중...",
    loadingInit: "UI 초기화 중",
    loadingRates: "시세 테이블 로딩 중",
    loadingChart: "차트 로딩 중",
    loadingDone: "마무리 중",
    sourceGuardTitle: "접근이 제한되었습니다",
    sourceGuardMessage: "Inspect/Debugger 기능이 차단되었습니다.",
    sourceGuardHint: "DevTools를 닫고 페이지를 새로고침하세요.",
    legendMarket: "시장가 변동",
    legendVolatility: "변동 캔들",
    legendVolume: "거래량",
    range24h: "24h",
    range7d: "7d",
    range30d: "30d",
    mobileSortAvg: "아데나 평균 정렬",
    mobileSortDefault: "기본 순서"
  },
  en: {
    title: "Kira Rate Adena VN Lineage Classic",
    subtitle: "Realtime 100% - Updated 24/7",
    refresh: "Refresh",
    listLenShort: "Short list",
    listLenMedium: "Medium list",
    listLenFull: "Full list",
    exportImage: "Export Full HD",
    exportImageWorking: "Exporting...",
    exportImageFailed: "Unable to export image right now.",
    copyImage: "Copy Full HD",
    copyImageWorking: "Copying...",
    copyImageFailed: "Unable to copy image to clipboard.",
    copyImageUnsupported: "Your browser does not support image clipboard copy.",
    exportScaleLabel: "Scale",
    exportImageStamp: "Exported at",
    exportImageServers: "All servers list",
    exportLt1m: "<1m Adena",
    exportGt1m: ">1m Adena",
    exportFast: "Bán nhanh",
    exportChange: "Change",
    searchPlaceholder: "Search (e.g., S1, S2, S3,... or server name)",
    updatedAt: "Updated",
    liveSlow: "Slow Sell",
    liveFast: "Fast Buy",
    liveMerged: "Merged Table",
    countSlow: "Slow",
    countFast: "Fast",
    headServer: "Server",
    headName: "Server Name (KR)",
    headRateLt1m: "<1m Adena",
    headRateGt1m: ">1m Adena",
    headFastRate: "Bán nhanh",
    headChange: "Market Change %",
    stale: "Data is in stale fallback mode and will auto-sync again.",
    errLoad: "Unable to load rate data. Please try again later.",
    noData: "-",
    selectedServer: "Server",
    crossFallback: "Fallback servers (slow < fast)",
    fallbackBadge: "Fallback",
    chartTitle: "Merged Chart",
    chartSubtitle: "Realtime market data + price candles + trading volume",
    dataTo: "Data to",
    chartDelay: "Delayed {minutes} min",
    chartStale: "Chart data is in stale fallback mode.",
    chartNoData: "No chart data for this server/range.",
    chartErr: "Unable to load chart. Keeping previous data if available.",
    chartLibMissing: "Chart library is missing.",
    chartLoadingLive: "Loading chart...",
    loadingInit: "Initializing interface",
    loadingRates: "Loading rates table",
    loadingChart: "Loading market chart",
    loadingDone: "Finalizing",
    sourceGuardTitle: "Access Restricted",
    sourceGuardMessage: "Inspect/debugger actions are blocked.",
    sourceGuardHint: "Close DevTools and refresh to continue.",
    legendMarket: "Market Price",
    legendVolatility: "Volatility Candles",
    legendVolume: "Volume",
    range24h: "24h",
    range7d: "7d",
    range30d: "30d",
    mobileSortAvg: "Sort by Avg Adena",
    mobileSortDefault: "Default S1→S28"
  }
};

const el = {
  title: document.getElementById("title"),
  subtitle: document.getElementById("subtitle"),
  bootLoader: document.getElementById("bootLoader"),
  bootLoaderRing: document.getElementById("bootLoaderRing"),
  bootLoaderPercent: document.getElementById("bootLoaderPercent"),
  bootLoaderText: document.getElementById("bootLoaderText"),
  langSelect: document.getElementById("langSelect"),
  listLengthSelect: document.getElementById("listLengthSelect"),
  exportListBtn: document.getElementById("exportListBtn"),
  copyListBtn: document.getElementById("copyListBtn"),
  exportScaleLabel: document.getElementById("exportScaleLabel"),
  exportScaleInput: document.getElementById("exportScaleInput"),
  refreshBtn: document.getElementById("refreshBtn"),
  searchInput: document.getElementById("searchInput"),
  errorText: document.getElementById("errorText"),

  metaSlow: document.getElementById("metaSlow"),
  statusSlow: document.getElementById("statusSlow"),
  slowHeadServer: document.getElementById("slowHeadServer"),
  slowHeadName: document.getElementById("slowHeadName"),
  slowHeadRateLt1m: document.getElementById("slowHeadRateLt1m"),
  slowHeadRateGt1m: document.getElementById("slowHeadRateGt1m"),
  slowHeadFast: document.getElementById("slowHeadFast"),
  slowHeadChange: document.getElementById("slowHeadChange"),
  mobileSortAvgBtn: document.getElementById("mobileSortAvgBtn"),
  mobileSortDefaultBtn: document.getElementById("mobileSortDefaultBtn"),
  slowRows: document.getElementById("slowRows"),
  slowStale: document.getElementById("slowStale"),
  slowCrossNote: document.getElementById("slowCrossNote"),

  chartTitle: document.getElementById("chartTitle"),
  chartSubtitle: document.getElementById("chartSubtitle"),
  selectedServerTag: document.getElementById("selectedServerTag"),
  chartMeta: document.getElementById("chartMeta"),
  chartLag: document.getElementById("chartLag"),
  chartStale: document.getElementById("chartStale"),
  chartCanvas: document.getElementById("chartCanvas"),
  chartHover: document.getElementById("chartHover"),
  chartLoading: document.getElementById("chartLoading"),
  chartLoadingText: document.getElementById("chartLoadingText"),
  chartEmpty: document.getElementById("chartEmpty"),

  legendMarket: document.getElementById("legendMarket"),
  legendVolatility: document.getElementById("legendVolatility"),
  legendVolume: document.getElementById("legendVolume"),
  toggleMarket: document.getElementById("toggleMarket"),
  toggleVolatility: document.getElementById("toggleVolatility"),
  toggleVolume: document.getElementById("toggleVolume"),

  rangeBtn24h: document.getElementById("rangeBtn24h"),
  rangeBtn7d: document.getElementById("rangeBtn7d"),
  rangeBtn30d: document.getElementById("rangeBtn30d")
};

let currentLang = loadLang();
let searchQuery = "";
let selectedServerCode = DEFAULT_SERVER_CODE;
let chartRange = DEFAULT_RANGE;
let seriesVisibility = loadSeriesVisibility();
let listLengthMode = loadListLengthMode();
let exportImageScale = loadExportImageScale();
let chartCrosshairBound = false;
let exportInProgress = false;
let copyInProgress = false;
let tableSort = {
  key: SORT_KEY_SERVER,
  direction: null
};

let responseState = {
  dataUpdatedAt: null,
  isStale: false,
  modes: {
    slow: { rows: [] },
    fast: { rows: [] }
  },
  notes: {
    crossRuleFallback: []
  }
};

let chartState = {
  updatedAt: null,
  isStale: false,
  lines: {
    market: []
  },
  candles: {
    volatility: []
  },
  volume: [],
  freshness: null
};

let chartApi = null;
let chartSeries = {
  market: null,
  volatility: null,
  volume: null
};
let chartResizeObserver = null;
let ratesInFlight = null;
let chartInFlight = null;
let chartInFlightKey = "";
let chartRequestToken = 0;
let bootLoaderStartedAt = Date.now();
let bootLoaderBaseText = "";
let bootLoaderDotCount = 0;
let bootLoaderTicker = null;
let sourceGuardLockEl = null;
let sourceGuardTitleEl = null;
let sourceGuardMessageEl = null;
let sourceGuardHintEl = null;
let sourceGuardCheckTicker = null;

function getApiBases() {
  const origin = window.location.origin || "";
  const protocol = window.location.protocol || "";
  const isLocalOrigin = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin);

  const bases = [""];
  if (!isLocalOrigin && protocol !== "file:") {
    return bases;
  }

  if (origin !== "http://127.0.0.1:3100") bases.push("http://127.0.0.1:3100");
  if (origin !== "http://localhost:3100") bases.push("http://localhost:3100");
  return Array.from(new Set(bases));
}

const API_BASES = getApiBases();

function loadLang() {
  try {
    const stored = localStorage.getItem(STORAGE_LANG_KEY);
    if (stored && I18N[stored]) return stored;
  } catch {
    // Ignore storage issues.
  }
  return DEFAULT_LANG;
}

function saveLang(lang) {
  try {
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  } catch {
    // Ignore storage issues.
  }
}

function loadSeriesVisibility() {
  try {
    const raw = localStorage.getItem(STORAGE_SERIES_VIS_KEY);
    if (!raw) return { ...DEFAULT_SERIES_VISIBILITY };
    const parsed = JSON.parse(raw);
    return {
      market: parsed?.market !== false,
      volatility: parsed?.volatility !== false,
      volume: parsed?.volume !== false
    };
  } catch {
    return { ...DEFAULT_SERIES_VISIBILITY };
  }
}

function saveSeriesVisibility() {
  try {
    localStorage.setItem(STORAGE_SERIES_VIS_KEY, JSON.stringify(seriesVisibility));
  } catch {
    // Ignore storage issues.
  }
}

function loadListLengthMode() {
  try {
    const stored = localStorage.getItem(STORAGE_LIST_LENGTH_KEY);
    if (stored && LIST_LENGTH_MODES.has(stored)) return stored;
  } catch {
    // Ignore storage issues.
  }
  return DEFAULT_LIST_LENGTH_MODE;
}

function saveListLengthMode(mode) {
  try {
    localStorage.setItem(STORAGE_LIST_LENGTH_KEY, mode);
  } catch {
    // Ignore storage issues.
  }
}

function normalizeExportScale(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return EXPORT_IMAGE_SCALE_DEFAULT;
  const clamped = Math.min(EXPORT_IMAGE_SCALE_MAX, Math.max(EXPORT_IMAGE_SCALE_MIN, parsed));
  const rounded = Math.round(clamped / EXPORT_IMAGE_SCALE_STEP) * EXPORT_IMAGE_SCALE_STEP;
  return Number(rounded.toFixed(2));
}

function formatExportScaleValue(value) {
  const raw = Number(value).toFixed(2);
  return raw.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function loadExportImageScale() {
  try {
    const stored = localStorage.getItem(STORAGE_EXPORT_SCALE_KEY);
    if (!stored) return EXPORT_IMAGE_SCALE_DEFAULT;
    return normalizeExportScale(stored);
  } catch {
    return EXPORT_IMAGE_SCALE_DEFAULT;
  }
}

function saveExportImageScale(value) {
  try {
    localStorage.setItem(STORAGE_EXPORT_SCALE_KEY, formatExportScaleValue(value));
  } catch {
    // Ignore storage issues.
  }
}

function applyListLengthMode() {
  const mode = LIST_LENGTH_MODES.has(listLengthMode) ? listLengthMode : DEFAULT_LIST_LENGTH_MODE;
  document.documentElement.setAttribute("data-list-length", mode);
  if (el.listLengthSelect) {
    el.listLengthSelect.value = mode;
  }
}

function text() {
  return I18N[currentLang] || I18N[DEFAULT_LANG];
}

function locale() {
  return LANG_TO_LOCALE[currentLang] || LANG_TO_LOCALE[DEFAULT_LANG];
}

function updateBootLoaderText() {
  if (!el.bootLoaderText) return;
  const dots = ".".repeat((bootLoaderDotCount % 3) + 1);
  el.bootLoaderText.textContent = `${bootLoaderBaseText}${dots}`;
}

function startBootLoaderTicker() {
  if (bootLoaderTicker) return;
  bootLoaderTicker = setInterval(() => {
    bootLoaderDotCount += 1;
    updateBootLoaderText();
  }, 360);
}

function stopBootLoaderTicker() {
  if (!bootLoaderTicker) return;
  clearInterval(bootLoaderTicker);
  bootLoaderTicker = null;
}

function setBootProgress(percent, message) {
  if (!el.bootLoader) return;
  const normalized = Math.max(0, Math.min(100, Number(percent) || 0));
  if (typeof message === "string" && message.trim()) {
    bootLoaderBaseText = message.trim();
  }

  if (el.bootLoaderRing) {
    el.bootLoaderRing.style.setProperty("--progress", normalized.toFixed(2));
  }
  if (el.bootLoaderPercent) {
    el.bootLoaderPercent.textContent = `${Math.round(normalized)}%`;
  }
  updateBootLoaderText();
}

async function hideBootLoader() {
  if (!el.bootLoader) return;
  const visibleFor = Date.now() - bootLoaderStartedAt;
  if (visibleFor < BOOT_LOADER_MIN_VISIBLE_MS) {
    await delay(BOOT_LOADER_MIN_VISIBLE_MS - visibleFor);
  }

  stopBootLoaderTicker();
  el.bootLoader.classList.add("is-hidden");
}

function browserTimeZone() {
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return detected || "UTC";
  } catch {
    return "UTC";
  }
}

function resolveChartUnix(time) {
  if (Number.isFinite(time)) {
    return Math.floor(time);
  }

  if (
    time &&
    typeof time === "object" &&
    Number.isFinite(time.year) &&
    Number.isFinite(time.month) &&
    Number.isFinite(time.day)
  ) {
    return Math.floor(Date.UTC(Number(time.year), Number(time.month) - 1, Number(time.day)) / 1000);
  }

  return null;
}

function formatChartTime(time, includeYear) {
  const unix = resolveChartUnix(time);
  if (!Number.isFinite(unix)) return "";

  const date = new Date(unix * 1000);
  return new Intl.DateTimeFormat(locale(), {
    timeZone: browserTimeZone(),
    hour12: false,
    year: includeYear ? "numeric" : undefined,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function normalizeFreshness(freshness) {
  if (!freshness || typeof freshness !== "object") return null;

  const latestPricePointAt =
    typeof freshness.latestPricePointAt === "string" ? freshness.latestPricePointAt : null;

  const lagRaw = Number(freshness.lagMinutes);
  const lagMinutes = Number.isFinite(lagRaw) && lagRaw >= 0 ? Math.floor(lagRaw) : null;

  const thresholdRaw = Number(freshness.thresholdMinutes);
  const thresholdMinutes =
    Number.isFinite(thresholdRaw) && thresholdRaw > 0
      ? Math.floor(thresholdRaw)
      : DEFAULT_DELAY_THRESHOLD_MINUTES;

  const isDelayed = Boolean(freshness.isDelayed) && Number.isFinite(lagMinutes);

  return {
    latestPricePointAt,
    lagMinutes,
    isDelayed,
    thresholdMinutes
  };
}

function formatDate(value) {
  if (!value) return text().noData;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return text().noData;
  return date.toLocaleString(locale(), {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return text().noData;
  return new Intl.NumberFormat(locale()).format(value);
}

function formatCompactK(value, fallback = text().noData) {
  if (!Number.isFinite(value)) return fallback;
  const compact = Math.floor((value / 1000) * 10) / 10;
  const formatted = new Intl.NumberFormat(locale(), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    useGrouping: false
  }).format(compact);
  return `${formatted}k`;
}

function formatCurrencyPer10k(value) {
  if (!Number.isFinite(value)) return text().noData;
  return `${formatCompactK(value)} VND /10k`;
}

function formatRateCompact(value) {
  return formatCompactK(value);
}

function getRateLt1mVnd(item) {
  const base = Number(item?.ratePer10kVndLt1m);
  if (Number.isFinite(base)) return base;
  const legacy = Number(item?.ratePer10kVnd);
  if (Number.isFinite(legacy)) return legacy;
  return null;
}

function getFastRateVnd(item) {
  const fast = Number(item?.fastRatePer10kVndFast);
  if (Number.isFinite(fast)) return fast;
  const legacy = Number(item?.fastRatePer10kVnd);
  if (Number.isFinite(legacy)) return legacy;
  return null;
}

function getRateGt1mVnd(item) {
  const explicit = Number(item?.ratePer10kVndGt1m);
  if (Number.isFinite(explicit)) return explicit;
  const base = getRateLt1mVnd(item);
  if (!Number.isFinite(base)) return null;
  return base + RATE_GT_1M_BONUS_VND;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return text().noData;
  const normalized = Number(value);
  const sign = normalized > 0 ? "+" : "";
  return `${sign}${normalized.toFixed(2)}%`;
}

function defaultRowComparator(a, b) {
  const orderA = Number(a?.order);
  const orderB = Number(b?.order);

  if (Number.isFinite(orderA) && Number.isFinite(orderB) && orderA !== orderB) {
    return orderA - orderB;
  }

  return String(a?.serverCode || "").localeCompare(String(b?.serverCode || ""), undefined, { numeric: true });
}

function compareNullableNumbers(a, b, direction) {
  const aNum = Number(a);
  const bNum = Number(b);
  const hasA = Number.isFinite(aNum);
  const hasB = Number.isFinite(bNum);

  if (!hasA && !hasB) return 0;
  if (!hasA) return 1;
  if (!hasB) return -1;
  if (aNum === bNum) return 0;

  return direction === "asc" ? aNum - bNum : bNum - aNum;
}

function getSortMetric(item, key) {
  switch (key) {
    case SORT_KEY_RATE_LT1M:
      return item?.hasData ? getRateLt1mVnd(item) : null;
    case SORT_KEY_RATE_GT1M:
      return item?.hasData ? getRateGt1mVnd(item) : null;
    case SORT_KEY_FAST:
      return item?.fastHasData ? getFastRateVnd(item) : null;
    case SORT_KEY_CHANGE:
      return Number.isFinite(item?.marketChangePct) ? Number(item.marketChangePct) : null;
    case SORT_KEY_AVG: {
      const values = [];
      const lt1m = item?.hasData ? getRateLt1mVnd(item) : null;
      const gt1m = item?.hasData ? getRateGt1mVnd(item) : null;
      const fast = item?.fastHasData ? getFastRateVnd(item) : null;
      if (Number.isFinite(lt1m)) values.push(lt1m);
      if (Number.isFinite(gt1m)) values.push(gt1m);
      if (Number.isFinite(fast)) values.push(fast);
      if (!values.length) return null;
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
    default:
      return null;
  }
}

function sortMergedRows(rows) {
  const source = Array.isArray(rows) ? rows : [];
  const sorted = [...source];

  if (tableSort.key === SORT_KEY_SERVER || !tableSort.direction) {
    sorted.sort(defaultRowComparator);
    return sorted;
  }

  sorted.sort((a, b) => {
    const cmp = compareNullableNumbers(
      getSortMetric(a, tableSort.key),
      getSortMetric(b, tableSort.key),
      tableSort.direction
    );

    if (cmp !== 0) return cmp;
    return defaultRowComparator(a, b);
  });

  return sorted;
}

function toggleTableSort(nextKey) {
  if (nextKey === SORT_KEY_SERVER) {
    tableSort = { key: SORT_KEY_SERVER, direction: null };
    return;
  }

  if (tableSort.key !== nextKey) {
    tableSort = { key: nextKey, direction: "desc" };
    return;
  }

  tableSort = {
    key: nextKey,
    direction: tableSort.direction === "desc" ? "asc" : "desc"
  };
}

function createSortHeaderNode(label, direction, showArrows) {
  const wrap = document.createElement("span");
  wrap.className = "sort-head-wrap";

  const textNode = document.createElement("span");
  textNode.className = "sort-head-label";
  textNode.textContent = label;
  wrap.appendChild(textNode);

  if (!showArrows) return wrap;

  const arrows = document.createElement("span");
  arrows.className = "sort-head-arrows";

  const up = document.createElement("span");
  up.className = `sort-arrow sort-arrow-up${direction === "asc" ? " is-on" : ""}`;
  up.textContent = "▲";

  const down = document.createElement("span");
  down.className = `sort-arrow sort-arrow-down${direction === "desc" ? " is-on" : ""}`;
  down.textContent = "▼";

  arrows.appendChild(up);
  arrows.appendChild(down);
  wrap.appendChild(arrows);
  return wrap;
}

function setHeaderSortState(headerEl, label, key, options = {}) {
  if (!headerEl) return;

  const showArrows = Boolean(options.showArrows);
  const rightAlign = Boolean(options.rightAlign);
  const isActive = tableSort.key === key && tableSort.direction;
  const direction = isActive ? tableSort.direction : "none";

  headerEl.classList.toggle("sortable-header", true);
  headerEl.classList.toggle("sortable-right", rightAlign);
  headerEl.classList.toggle("sortable-active", Boolean(isActive));
  headerEl.dataset.sortKey = key;
  headerEl.dataset.sortDir = direction;
  headerEl.setAttribute("role", "button");
  headerEl.setAttribute("tabindex", "0");
  headerEl.setAttribute("aria-sort", direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none");

  const node = createSortHeaderNode(label, direction, showArrows);
  headerEl.replaceChildren(node);
}

function refreshTableHeaderState() {
  const t = text();

  setHeaderSortState(el.slowHeadServer, t.headServer, SORT_KEY_SERVER, {
    showArrows: false,
    rightAlign: false
  });

  if (el.slowHeadName) {
    el.slowHeadName.classList.remove("sortable-header", "sortable-right", "sortable-active");
    el.slowHeadName.removeAttribute("data-sort-key");
    el.slowHeadName.removeAttribute("data-sort-dir");
    el.slowHeadName.removeAttribute("role");
    el.slowHeadName.removeAttribute("tabindex");
    el.slowHeadName.removeAttribute("aria-sort");
    el.slowHeadName.textContent = t.headName;
  }

  setHeaderSortState(el.slowHeadRateLt1m, t.headRateLt1m, SORT_KEY_RATE_LT1M, {
    showArrows: true,
    rightAlign: true
  });
  setHeaderSortState(el.slowHeadRateGt1m, t.headRateGt1m, SORT_KEY_RATE_GT1M, {
    showArrows: true,
    rightAlign: true
  });
  setHeaderSortState(el.slowHeadFast, t.headFastRate, SORT_KEY_FAST, {
    showArrows: true,
    rightAlign: true
  });
  setHeaderSortState(el.slowHeadChange, t.headChange, SORT_KEY_CHANGE, {
    showArrows: true,
    rightAlign: true
  });

  refreshMobileSortButtons();
}

function refreshMobileSortButtons() {
  if (!el.mobileSortAvgBtn || !el.mobileSortDefaultBtn) return;

  const isAvgActive = tableSort.key === SORT_KEY_AVG && tableSort.direction === "desc";
  const isDefaultActive = tableSort.key === SORT_KEY_SERVER && !tableSort.direction;

  el.mobileSortAvgBtn.classList.toggle("is-active", isAvgActive);
  el.mobileSortAvgBtn.setAttribute("aria-pressed", isAvgActive ? "true" : "false");
  el.mobileSortDefaultBtn.classList.toggle("is-active", isDefaultActive);
  el.mobileSortDefaultBtn.setAttribute("aria-pressed", isDefaultActive ? "true" : "false");
}

function createCell(content, className, labelText) {
  const td = document.createElement("td");
  td.className = className;
  td.setAttribute("data-label", labelText);
  if (typeof content === "string") {
    td.textContent = content;
  } else {
    td.appendChild(content);
  }
  return td;
}

function setRatesError(message) {
  if (!message) {
    el.errorText.style.display = "none";
    el.errorText.textContent = "";
    return;
  }
  el.errorText.style.display = "block";
  el.errorText.textContent = message;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldBlockShortcut(event) {
  const key = String(event?.key || "").toLowerCase();
  return key === "f12";
}

function ensureSourceGuardLockElement() {
  if (sourceGuardLockEl) return;

  const lock = document.createElement("div");
  lock.id = "sourceGuardLock";
  lock.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:100000",
    "display:none",
    "align-items:center",
    "justify-content:center",
    "padding:20px",
    "background:rgba(5,10,17,0.96)",
    "backdrop-filter:blur(4px)",
    "user-select:none",
    "cursor:not-allowed"
  ].join(";");

  const card = document.createElement("div");
  card.style.cssText = [
    "width:min(92vw,420px)",
    "border:1px solid rgba(255,122,80,0.42)",
    "border-radius:14px",
    "padding:18px 16px",
    "background:linear-gradient(180deg, rgba(23,34,49,0.98), rgba(15,25,36,0.98))",
    "box-shadow:0 16px 38px rgba(0,0,0,0.42)",
    "text-align:center"
  ].join(";");

  const title = document.createElement("div");
  title.style.cssText = "font-size:16px;font-weight:800;color:#ffd2c2;margin-bottom:6px;";
  const message = document.createElement("div");
  message.style.cssText = "font-size:13px;font-weight:600;color:#e8f2fc;margin-bottom:8px;";
  const hint = document.createElement("div");
  hint.style.cssText = "font-size:12px;color:#9eb4c9;";

  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(hint);
  lock.appendChild(card);
  document.body.appendChild(lock);

  sourceGuardLockEl = lock;
  sourceGuardTitleEl = title;
  sourceGuardMessageEl = message;
  sourceGuardHintEl = hint;
}

function syncSourceGuardText() {
  if (!sourceGuardLockEl) return;
  const t = text();
  sourceGuardTitleEl.textContent = t.sourceGuardTitle;
  sourceGuardMessageEl.textContent = t.sourceGuardMessage;
  sourceGuardHintEl.textContent = t.sourceGuardHint;
}

function showSourceGuardLock() {
  ensureSourceGuardLockElement();
  syncSourceGuardText();
  sourceGuardLockEl.style.display = "flex";
}

function looksLikeDevToolsOpen() {
  const widthGap = Math.max(0, window.outerWidth - window.innerWidth);
  const heightGap = Math.max(0, window.outerHeight - window.innerHeight);

  // Treat as DevTools only when one axis is large and the other axis remains small.
  // This avoids false positives from browser zoom, where both gaps often change together.
  const looksLikeSideDock = widthGap > DEVTOOLS_GAP_THRESHOLD && heightGap < DEVTOOLS_SECONDARY_GAP_MAX;
  const looksLikeBottomDock = heightGap > DEVTOOLS_GAP_THRESHOLD && widthGap < DEVTOOLS_SECONDARY_GAP_MAX;

  return looksLikeSideDock || looksLikeBottomDock;
}

function bindSourceGuard() {
  if (!SOURCE_GUARD_ENABLED) return;

  document.addEventListener(
    "contextmenu",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
    },
    { capture: true }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (!shouldBlockShortcut(event)) return;
      event.preventDefault();
      event.stopPropagation();
    },
    { capture: true }
  );
}

async function fetchJsonWithFallback(pathWithQuery) {
  let lastError = null;

  for (const base of API_BASES) {
    const url = `${base}${pathWithQuery}`;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_FETCH_TIMEOUT_MS);
      try {
        const response = await fetch(url, {
          cache: "no-store",
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} @ ${url}`);
        }
        return response.json();
      } catch (error) {
        const isAbort = error?.name === "AbortError";
        lastError = isAbort
          ? new Error(`Timeout ${API_FETCH_TIMEOUT_MS}ms @ ${url}`)
          : error;
        if (attempt === 0) {
          await delay(220);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }

  throw lastError || new Error("Unable to reach API endpoint");
}

function setChartMessage(message, visible) {
  el.chartEmpty.textContent = message;
  el.chartEmpty.style.display = visible ? "block" : "none";
}

function setChartLoading(visible, label) {
  if (!el.chartLoading) return;
  if (el.chartLoadingText && typeof label === "string" && label.trim()) {
    el.chartLoadingText.textContent = label;
  }
  el.chartLoading.classList.toggle("is-visible", Boolean(visible));
  el.chartLoading.setAttribute("aria-hidden", visible ? "false" : "true");
}

function hideChartHover() {
  if (!el.chartHover) return;
  el.chartHover.style.display = "none";
}

function findMarketPointAtOrBefore(targetUnix) {
  const points = Array.isArray(chartState.lines?.market) ? chartState.lines.market : [];
  if (!points.length || !Number.isFinite(targetUnix)) return null;

  let left = 0;
  let right = points.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = Number(points[mid]?.time);
    if (midValue === targetUnix) return points[mid];
    if (midValue < targetUnix) left = mid + 1;
    else right = mid - 1;
  }

  if (right >= 0) return points[right];
  return points[0] || null;
}

function renderChartHover(param) {
  if (!ENABLE_CHART_HOVER) {
    hideChartHover();
    return;
  }

  if (!el.chartHover) {
    hideChartHover();
    return;
  }

  const point = param?.point;
  const seriesData = param?.seriesData;
  const marketCross = seriesData?.get?.(chartSeries.market) || null;
  const candleCross = seriesData?.get?.(chartSeries.volatility) || null;

  const time = resolveChartUnix(marketCross?.time ?? candleCross?.time ?? param?.time);

  if (!point || !Number.isFinite(time)) {
    hideChartHover();
    return;
  }

  const rect = el.chartCanvas.getBoundingClientRect();
  if (point.x < 0 || point.y < 0 || point.x > rect.width || point.y > rect.height) {
    hideChartHover();
    return;
  }

  const marketExactValue = Number(marketCross?.value);
  let marketValue = Number.isFinite(marketExactValue) ? marketExactValue : null;
  let marketSourceTime = resolveChartUnix(marketCross?.time);

  if (!Number.isFinite(marketValue)) {
    const fallbackPoint = findMarketPointAtOrBefore(time);
    marketValue = Number(fallbackPoint?.value);
    marketSourceTime = Number(fallbackPoint?.time);
  }

  if (!Number.isFinite(marketValue)) {
    hideChartHover();
    return;
  }

  const nearestTag = Number.isFinite(marketSourceTime) && marketSourceTime !== time ? " (gần nhất)" : "";
  el.chartHover.textContent = `${formatChartTime(time, true)} ${formatCurrencyPer10k(marketValue)}${nearestTag}`;

  const hoverWidth = Math.max(180, Math.min(420, Math.floor(rect.width * 0.9)));
  el.chartHover.style.maxWidth = `${hoverWidth}px`;

  const x = Math.max(8, Math.min(rect.width - hoverWidth - 8, point.x + 12));
  const y = Math.max(8, Math.min(rect.height - 64, point.y - 52));

  el.chartHover.style.left = `${x}px`;
  el.chartHover.style.top = `${y}px`;
  el.chartHover.style.display = "block";
}

function getAllRows() {
  const slowRows = responseState.modes?.slow?.rows || [];
  const fastRows = responseState.modes?.fast?.rows || [];
  const map = new Map();

  for (const row of [...slowRows, ...fastRows]) {
    if (row?.serverCode && !map.has(row.serverCode)) {
      map.set(row.serverCode, row);
    }
  }

  return Array.from(map.values());
}

function getServerNameByCode(serverCode) {
  const found = getAllRows().find((row) => row.serverCode === serverCode);
  return found?.serverNameKr || serverCode;
}

function ensureSelectedServerExists() {
  const exists = getAllRows().some((row) => row.serverCode === selectedServerCode);
  if (!exists) {
    selectedServerCode = DEFAULT_SERVER_CODE;
  }
}

function normalizeServerCodeToken(token) {
  const match = String(token || "")
    .trim()
    .toLowerCase()
    .match(/^s0*([1-9]\d*)$/);
  if (!match) return null;
  return `s${Number(match[1])}`;
}

function filterRows(rows) {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return rows;

  const tokens = query
    .split(/[,\s]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (!tokens.length) return rows;

  const serverCodeTokens = new Set();
  const textTokens = [];

  for (const token of tokens) {
    const normalizedCode = normalizeServerCodeToken(token);
    if (normalizedCode) {
      serverCodeTokens.add(normalizedCode);
    } else {
      textTokens.push(token);
    }
  }

  return rows.filter((row) => {
    const rowServerCode = String(row.serverCode || "").trim().toLowerCase();
    const rowServerName = String(row.serverNameKr || "").toLowerCase();
    const codeExactMatch = serverCodeTokens.has(rowServerCode);

    if (serverCodeTokens.size > 0 && textTokens.length === 0) {
      return codeExactMatch;
    }

    if (codeExactMatch) {
      return true;
    }

    return (
      rowServerCode.includes(query) ||
      rowServerName.includes(query) ||
      textTokens.some((token) => rowServerCode.includes(token) || rowServerName.includes(token))
    );
  });
}

function buildMergedRows() {
  const slowRows = Array.isArray(responseState.modes?.slow?.rows) ? responseState.modes.slow.rows : [];
  const fastRows = Array.isArray(responseState.modes?.fast?.rows) ? responseState.modes.fast.rows : [];
  const fastByServer = new Map();
  const merged = [];
  const seen = new Set();

  for (const fast of fastRows) {
    if (!fast?.serverCode) continue;
    fastByServer.set(fast.serverCode, fast);
  }

  for (const slow of slowRows) {
    if (!slow?.serverCode) continue;
    const fast = fastByServer.get(slow.serverCode) || null;
    seen.add(slow.serverCode);
    const slowHasData = Boolean(
      slow?.hasData ||
        Number.isFinite(Number(slow?.ratePer10kVndLt1m)) ||
        Number.isFinite(Number(slow?.ratePer10kVndGt1m)) ||
        Number.isFinite(Number(slow?.ratePer10kVnd))
    );
    merged.push({
      ...slow,
      hasData: slowHasData,
      serverNameKr: slow.serverNameKr || fast?.serverNameKr || "",
      marketChangePct: Number.isFinite(slow.marketChangePct)
        ? slow.marketChangePct
        : Number.isFinite(fast?.marketChangePct)
          ? fast.marketChangePct
          : null,
      fastRatePer10kVnd: Number.isFinite(fast?.ratePer10kVnd) ? Number(fast.ratePer10kVnd) : null,
      fastRatePer10kVndFast: Number.isFinite(fast?.ratePer10kVndFast)
        ? Number(fast.ratePer10kVndFast)
        : Number.isFinite(fast?.ratePer10kVnd)
          ? Number(fast.ratePer10kVnd)
          : null,
      fastHasData: Boolean(
        fast?.hasData &&
          (Number.isFinite(fast?.ratePer10kVndFast) || Number.isFinite(fast?.ratePer10kVnd))
      )
    });
  }

  for (const fast of fastRows) {
    if (!fast?.serverCode || seen.has(fast.serverCode)) continue;
    merged.push({
      serverCode: fast.serverCode,
      serverNameKr: fast.serverNameKr || "",
      order: fast.order,
      hasData: false,
      ratePer10kVnd: null,
      marketChangePct: Number.isFinite(fast.marketChangePct) ? fast.marketChangePct : null,
      crossRuleStatus: "no_slow_data",
      fastRatePer10kVnd: Number.isFinite(fast.ratePer10kVnd) ? Number(fast.ratePer10kVnd) : null,
      fastRatePer10kVndFast: Number.isFinite(fast.ratePer10kVndFast)
        ? Number(fast.ratePer10kVndFast)
        : Number.isFinite(fast.ratePer10kVnd)
          ? Number(fast.ratePer10kVnd)
          : null,
      fastHasData: Boolean(
        fast.hasData && (Number.isFinite(fast.ratePer10kVndFast) || Number.isFinite(fast.ratePer10kVnd))
      )
    });
  }

  merged.sort((a, b) => {
    const orderA = Number(a?.order);
    const orderB = Number(b?.order);
    if (Number.isFinite(orderA) && Number.isFinite(orderB) && orderA !== orderB) {
      return orderA - orderB;
    }
    return String(a?.serverCode || "").localeCompare(String(b?.serverCode || ""), undefined, { numeric: true });
  });

  return merged;
}

function renderRows(rows, tbody) {
  const t = text();
  const data = sortMergedRows(filterRows(Array.isArray(rows) ? rows : []));
  const fragment = document.createDocumentFragment();

  for (const item of data) {
    const tr = document.createElement("tr");
    tr.dataset.serverCode = item.serverCode || "";

    if (item.serverCode === selectedServerCode) {
      tr.classList.add("selected-row");
    }

    if (item.crossRuleStatus === "fallback_below_fast") {
      tr.classList.add("cross-fallback-row");
    }

    tr.addEventListener("click", () => {
      const selectedText = window.getSelection?.().toString?.().trim();
      if (selectedText) return;
      if (!item.serverCode || selectedServerCode === item.serverCode) return;
      selectedServerCode = item.serverCode;
      renderAll();
      loadChart();
    });

    const serverWrap = document.createElement("span");
    serverWrap.className = "server-cell";
    serverWrap.innerHTML = `<span class="server-code">${item.serverCode || "?"}</span>`;

    if (item.crossRuleStatus === "fallback_below_fast") {
      const fallbackBadge = document.createElement("span");
      fallbackBadge.className = "fallback-inline";
      fallbackBadge.textContent = t.fallbackBadge;
      serverWrap.appendChild(fallbackBadge);
    }

    tr.appendChild(createCell(serverWrap, "", t.headServer));
    tr.appendChild(createCell(item.serverNameKr || t.noData, "name-cell", t.headName));

    const rateLt1m = item.hasData ? getRateLt1mVnd(item) : null;
    const rateGt1m = item.hasData ? getRateGt1mVnd(item) : null;
    const fastRate = item.fastHasData ? getFastRateVnd(item) : null;

    tr.appendChild(createCell(formatRateCompact(rateLt1m), "rate-cell", t.headRateLt1m));
    tr.appendChild(createCell(formatRateCompact(rateGt1m), "rate-cell", t.headRateGt1m));
    tr.appendChild(createCell(formatRateCompact(fastRate), "rate-cell", t.headFastRate));

    const changeCell = document.createElement("td");
    changeCell.className = "change-cell";
    changeCell.setAttribute("data-label", t.headChange);

    if (!Number.isFinite(item.marketChangePct)) {
      changeCell.textContent = t.noData;
      changeCell.classList.add("flat");
    } else {
      changeCell.textContent = formatPercent(item.marketChangePct);
      if (item.marketChangePct > 0) changeCell.classList.add("up");
      else if (item.marketChangePct < 0) changeCell.classList.add("down");
      else changeCell.classList.add("flat");
    }

    tr.appendChild(changeCell);
    fragment.appendChild(tr);
  }

  tbody.innerHTML = "";
  tbody.appendChild(fragment);
}

function fitTextWithEllipsis(ctx, value, maxWidth) {
  const source = String(value ?? "");
  if (!source) return "";
  if (ctx.measureText(source).width <= maxWidth) return source;
  let text = source;
  while (text.length > 0 && ctx.measureText(`${text}…`).width > maxWidth) {
    text = text.slice(0, -1);
  }
  return text ? `${text}…` : "";
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function loadImageAsset(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image load failed: ${src}`));
    img.src = src;
  });
}

function getExportLogoElement() {
  const logo = document.querySelector(".mark img");
  if (logo && logo.complete && Number(logo.naturalWidth) > 0 && Number(logo.naturalHeight) > 0) {
    return logo;
  }
  return null;
}

function getExportLogoUrl() {
  const logo = document.querySelector(".mark img");
  if (logo?.currentSrc) return logo.currentSrc;
  if (logo?.src) return logo.src;

  try {
    return new URL("./logoKRLC.png", window.location.href).href;
  } catch {
    return "./logoKRLC.png";
  }
}

function isImageClipboardSupported() {
  return Boolean(navigator?.clipboard?.write && typeof window.ClipboardItem !== "undefined");
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}

function updateExportButtonState() {
  const t = text();
  const busy = exportInProgress || copyInProgress;

  if (el.exportListBtn) {
    el.exportListBtn.textContent = exportInProgress ? t.exportImageWorking : t.exportImage;
    el.exportListBtn.disabled = busy;
  }

  if (el.copyListBtn) {
    const supported = isImageClipboardSupported();
    el.copyListBtn.textContent = copyInProgress ? t.copyImageWorking : t.copyImage;
    el.copyListBtn.disabled = busy || !supported;
    el.copyListBtn.title = supported ? "" : t.copyImageUnsupported;
  }

  if (el.exportScaleInput) {
    el.exportScaleInput.disabled = busy;
    el.exportScaleInput.value = formatExportScaleValue(exportImageScale);
  }
}

async function buildMergedListImageCanvas() {
  const t = text();
  const rows = sortMergedRows(buildMergedRows());
  if (!rows.length) throw new Error("No rows to export");

  const outerPad = 34;
  const panelInnerPad = 24;
  const headerHeight = 212;
  const tableHeadHeight = 68;
  const rowHeight = 62;
  const tableHeight = tableHeadHeight + rows.length * rowHeight;
  const tableTop = outerPad + panelInnerPad + headerHeight + 16;
  const contentHeight = tableTop + tableHeight + panelInnerPad + outerPad;
  const imageHeight = Math.max(EXPORT_IMAGE_BASE_HEIGHT, contentHeight);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(EXPORT_IMAGE_WIDTH * exportImageScale);
  canvas.height = Math.round(imageHeight * exportImageScale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.scale(exportImageScale, exportImageScale);

  const bgGrad = ctx.createLinearGradient(0, 0, 0, imageHeight);
  bgGrad.addColorStop(0, "#0e1a2a");
  bgGrad.addColorStop(1, "#09111a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, EXPORT_IMAGE_WIDTH, imageHeight);

  const panelX = outerPad;
  const panelY = outerPad;
  const panelWidth = EXPORT_IMAGE_WIDTH - outerPad * 2;
  const panelHeight = imageHeight - outerPad * 2;
  ctx.save();
  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 22);
  ctx.fillStyle = "rgba(18, 29, 42, 0.96)";
  ctx.fill();
  ctx.strokeStyle = "rgba(57, 81, 108, 0.92)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();

  const headerX = panelX + panelInnerPad;
  const headerY = panelY + panelInnerPad;
  const headerWidth = panelWidth - panelInnerPad * 2;
  ctx.save();
  drawRoundedRect(ctx, headerX, headerY, headerWidth, headerHeight, 16);
  ctx.fillStyle = "rgba(14, 24, 36, 0.9)";
  ctx.fill();
  ctx.strokeStyle = "rgba(62, 88, 116, 0.8)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  const logoSize = 170;
  const logoX = headerX + 12;
  const logoY = headerY + 12;
  ctx.save();
  drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 24);
  ctx.fillStyle = "rgba(12, 23, 35, 0.95)";
  ctx.fill();
  ctx.clip();
  try {
    const existingLogo = getExportLogoElement();
    if (existingLogo) {
      ctx.drawImage(existingLogo, logoX, logoY, logoSize, logoSize);
    } else {
      const logo = await loadImageAsset(getExportLogoUrl());
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    }
  } catch {
    ctx.fillStyle = "#2c4259";
    ctx.fillRect(logoX, logoY, logoSize, logoSize);
  }
  ctx.restore();

  const textX = logoX + logoSize + 30;
  const textAreaWidth = headerWidth - (textX - headerX) - 22;
  const titleY = headerY + 70;
  const subtitleY = headerY + 126;
  const stampY = headerY + 166;

  let titleFontSize = 54;
  while (titleFontSize > 40) {
    ctx.font = `700 ${titleFontSize}px "Be Vietnam Pro","Noto Sans KR",sans-serif`;
    if (ctx.measureText(t.title).width <= textAreaWidth) break;
    titleFontSize -= 1;
  }

  ctx.save();
  drawRoundedRect(ctx, headerX + 2, headerY + 2, headerWidth - 4, headerHeight - 4, 14);
  ctx.clip();

  ctx.fillStyle = "#edf5ff";
  ctx.font = `700 ${titleFontSize}px "Be Vietnam Pro","Noto Sans KR",sans-serif`;
  ctx.fillText(fitTextWithEllipsis(ctx, t.title, textAreaWidth), textX, titleY);

  ctx.fillStyle = "#9bb1c8";
  ctx.font = '600 28px "Be Vietnam Pro","Noto Sans KR",sans-serif';
  ctx.fillText(fitTextWithEllipsis(ctx, `${t.exportImageServers} · ${rows.length}`, textAreaWidth), textX, subtitleY);

  ctx.fillStyle = "#a7b9cc";
  ctx.font = '600 28px "Be Vietnam Pro","Noto Sans KR",sans-serif';
  ctx.fillText(
    fitTextWithEllipsis(
      ctx,
      `${t.exportImageStamp}: ${new Date().toLocaleString(locale(), { hour12: false })}`,
      textAreaWidth
    ),
    textX,
    stampY
  );
  ctx.restore();

  const tableX = headerX;
  const tableY = tableTop;
  const tableWidth = headerWidth;
  const colRatios = [0.095, 0.17, 0.2, 0.2, 0.2, 0.135];
  const colWidths = colRatios.map((ratio) => Math.floor(tableWidth * ratio));
  colWidths[colWidths.length - 1] += tableWidth - colWidths.reduce((sum, width) => sum + width, 0);
  const headers = [t.headServer, t.headName, t.headRateLt1m, t.headRateGt1m, t.headFastRate, t.headChange];

  ctx.save();
  drawRoundedRect(ctx, tableX, tableY, tableWidth, tableHeight, 14);
  ctx.fillStyle = "rgba(11, 21, 33, 0.9)";
  ctx.fill();
  ctx.strokeStyle = "rgba(56, 81, 107, 0.85)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#152434";
  ctx.fillRect(tableX, tableY, tableWidth, tableHeadHeight);

  ctx.strokeStyle = "rgba(52, 76, 101, 0.75)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(tableX, tableY + tableHeadHeight + 0.5);
  ctx.lineTo(tableX + tableWidth, tableY + tableHeadHeight + 0.5);
  ctx.stroke();

  let cursorX = tableX;
  for (let i = 0; i < colWidths.length; i += 1) {
    const w = colWidths[i];
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(cursorX + 0.5, tableY);
      ctx.lineTo(cursorX + 0.5, tableY + tableHeight);
      ctx.strokeStyle = "rgba(52, 76, 101, 0.48)";
      ctx.stroke();
    }

    ctx.fillStyle = "#9cb2c9";
    ctx.font = '700 26px "Be Vietnam Pro","Noto Sans KR",sans-serif';
    const alignRight = i >= 2;
    ctx.textAlign = alignRight ? "right" : "left";
    const textXCol = alignRight ? cursorX + w - 12 : cursorX + 12;
    const label = fitTextWithEllipsis(ctx, headers[i], w - 24);
    ctx.fillText(label, textXCol, tableY + 46);
    cursorX += w;
  }

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const item = rows[rowIndex];
    const rowY = tableY + tableHeadHeight + rowIndex * rowHeight;

    if (rowIndex % 2 === 1) {
      ctx.fillStyle = "rgba(22, 35, 50, 0.4)";
      ctx.fillRect(tableX, rowY, tableWidth, rowHeight);
    }

    ctx.beginPath();
    ctx.moveTo(tableX, rowY + rowHeight + 0.5);
    ctx.lineTo(tableX + tableWidth, rowY + rowHeight + 0.5);
    ctx.strokeStyle = "rgba(52, 76, 101, 0.35)";
    ctx.stroke();

    const slowLt = item.hasData ? getRateLt1mVnd(item) : null;
    const slowGt = item.hasData ? getRateGt1mVnd(item) : null;
    const fastRate = item.fastHasData ? getFastRateVnd(item) : null;
    const changeText = Number.isFinite(item.marketChangePct) ? formatPercent(item.marketChangePct) : t.noData;
    const values = [
      item.serverCode || t.noData,
      item.serverNameKr || t.noData,
      formatRateCompact(slowLt),
      formatRateCompact(slowGt),
      formatRateCompact(fastRate),
      changeText
    ];

    let x = tableX;
    for (let col = 0; col < colWidths.length; col += 1) {
      const w = colWidths[col];
      const alignRight = col >= 2;
      const textXCol = alignRight ? x + w - 12 : x + 12;
      const textValue = fitTextWithEllipsis(ctx, values[col], w - 24);

      if (col === 5 && Number.isFinite(item.marketChangePct)) {
        if (item.marketChangePct > 0) ctx.fillStyle = "#ff8a8a";
        else if (item.marketChangePct < 0) ctx.fillStyle = "#67b5ff";
        else ctx.fillStyle = "#95a8be";
      } else if (col >= 2 && col <= 4) {
        ctx.fillStyle = "#ffe8bf";
      } else {
        ctx.fillStyle = "#d5e4f3";
      }

      ctx.font = '600 30px "Be Vietnam Pro","Noto Sans KR",sans-serif';
      ctx.textAlign = alignRight ? "right" : "left";
      ctx.fillText(textValue, textXCol, rowY + 44);
      x += w;
    }
  }

  ctx.textAlign = "left";
  return canvas;
}

async function exportMergedListImage() {
  if (exportInProgress || copyInProgress) return;

  exportInProgress = true;
  updateExportButtonState();

  try {
    const canvas = await buildMergedListImageCanvas();
    const filenameStamp = new Date().toISOString().replace(/[:.]/g, "-");
    const link = document.createElement("a");
    link.download = `kira-rate-list-${filenameStamp}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("exportMergedListImage failed:", error);
    window.alert(text().exportImageFailed);
  } finally {
    exportInProgress = false;
    updateExportButtonState();
  }
}

async function copyMergedListImage() {
  if (exportInProgress || copyInProgress) return;

  if (!isImageClipboardSupported()) {
    window.alert(text().copyImageUnsupported);
    return;
  }

  copyInProgress = true;
  updateExportButtonState();

  try {
    const canvas = await buildMergedListImageCanvas();
    const blob = await canvasToBlob(canvas);
    await navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
  } catch (error) {
    console.error("copyMergedListImage failed:", error);
    window.alert(text().copyImageFailed);
  } finally {
    copyInProgress = false;
    updateExportButtonState();
  }
}

function renderCrossFallbackNote() {
  if (!el.slowCrossNote) return;

  const t = text();
  const notes = Array.isArray(responseState.notes?.crossRuleFallback)
    ? responseState.notes.crossRuleFallback
    : [];

  if (!notes.length) {
    el.slowCrossNote.style.display = "none";
    el.slowCrossNote.textContent = "";
    return;
  }

  const serverList = notes.map((item) => item.serverCode).join(", ");
  el.slowCrossNote.textContent = `${t.crossFallback}: ${serverList}`;
  el.slowCrossNote.style.display = "block";
}

function renderMeta() {
  const t = text();
  const updated = formatDate(responseState.dataUpdatedAt);

  const slowRows = responseState.modes?.slow?.rows || [];
  const fastRows = responseState.modes?.fast?.rows || [];
  const slowCount = slowRows.filter((row) => row.hasData).length;
  const fastCount = fastRows.filter((row) => row.hasData).length;

  if (el.metaSlow) {
    const totalServers = Math.max(slowRows.length, fastRows.length, 0);
    el.metaSlow.textContent = `${t.updatedAt}: ${updated} · ${t.countSlow}: ${slowCount}/${totalServers} · ${t.countFast}: ${fastCount}/${totalServers}`;
  }
  if (el.statusSlow) {
    el.statusSlow.textContent = t.liveMerged || t.liveSlow;
  }

  if (el.slowStale) {
    el.slowStale.textContent = t.stale;
    el.slowStale.style.display = responseState.isStale ? "block" : "none";
  }

  renderCrossFallbackNote();
}

function renderSelectedServerTag() {
  const t = text();
  const serverName = getServerNameByCode(selectedServerCode);
  el.selectedServerTag.textContent = `${t.selectedServer}: ${selectedServerCode} · ${serverName}`;
}

function renderChartMeta() {
  const t = text();
  const latestPointAt = chartState.freshness?.latestPricePointAt || null;
  const lagMinutes = chartState.freshness?.lagMinutes;
  const isDelayed = Boolean(chartState.freshness?.isDelayed) && Number.isFinite(lagMinutes);

  el.chartMeta.textContent = `${t.updatedAt}: ${formatDate(chartState.updatedAt)} · ${t.dataTo}: ${formatDate(
    latestPointAt
  )}`;

  if (isDelayed && el.chartLag) {
    el.chartLag.textContent = t.chartDelay.replace("{minutes}", formatNumber(lagMinutes));
    el.chartLag.style.display = "inline-flex";
  } else if (el.chartLag) {
    el.chartLag.textContent = "";
    el.chartLag.style.display = "none";
  }

  el.chartStale.textContent = t.chartStale;
  el.chartStale.style.display = chartState.isStale ? "inline" : "none";
  renderSelectedServerTag();
}

function updateRangeButtons() {
  const buttons = [el.rangeBtn24h, el.rangeBtn7d, el.rangeBtn30d];
  for (const button of buttons) {
    button.classList.toggle("active", button.dataset.range === chartRange);
  }
}

function setLegendToggleState(button, active) {
  if (!button) return;
  button.classList.toggle("is-active", Boolean(active));
  button.setAttribute("aria-pressed", String(Boolean(active)));
}

function renderLegendToggles() {
  setLegendToggleState(el.toggleMarket, seriesVisibility.market);
  setLegendToggleState(el.toggleVolatility, seriesVisibility.volatility);
  setLegendToggleState(el.toggleVolume, seriesVisibility.volume);
}

function getChartViewportSize() {
  const rawWidth = el.chartCanvas?.clientWidth || 0;
  const rawHeight = el.chartCanvas?.clientHeight || 0;
  const width = Math.max(320, rawWidth || 320);
  const height = Math.max(280, rawHeight || 280);
  return { width, height };
}

function ensureChart() {
  if (!window.LightweightCharts) return false;
  if (chartApi) return true;

  const size = getChartViewportSize();
  chartApi = window.LightweightCharts.createChart(el.chartCanvas, {
    width: size.width,
    height: size.height,
    layout: {
      background: { type: "solid", color: "#0f1823" },
      textColor: "#b8cadb",
      fontFamily: '"Be Vietnam Pro", "Noto Sans KR", sans-serif'
    },
    grid: {
      vertLines: { color: "rgba(70, 96, 121, 0.22)" },
      horzLines: { color: "rgba(70, 96, 121, 0.22)" }
    },
    rightPriceScale: {
      borderColor: "#2b3d52",
      minimumWidth: CHART_RIGHT_SCALE_MIN_WIDTH
    },
    leftPriceScale: {
      visible: false,
      borderVisible: false
    },
    localization: {
      locale: locale(),
      timeFormatter: (time) => formatChartTime(time, true),
      priceFormatter: (price) => formatCompactK(Number(price), "")
    },
    timeScale: {
      borderColor: "#2b3d52",
      timeVisible: true,
      tickMarkFormatter: (time) => formatChartTime(time, false)
    }
  });

  chartSeries.market = chartApi.addLineSeries({
    color: "#ff9f5a",
    lineWidth: 2,
    priceLineVisible: false,
    priceFormat: {
      type: "custom",
      minMove: 0.1,
      formatter: (price) => formatCompactK(Number(price), "")
    }
  });

  chartSeries.volatility = chartApi.addCandlestickSeries({
    upColor: "#ff5f6d",
    downColor: "#5aa2ff",
    wickUpColor: "#ff5f6d",
    wickDownColor: "#5aa2ff",
    borderVisible: false,
    priceLineVisible: false,
    priceFormat: {
      type: "custom",
      minMove: 0.1,
      formatter: (price) => formatCompactK(Number(price), "")
    }
  });

  chartSeries.volume = chartApi.addHistogramSeries({
    priceScaleId: "volume",
    priceLineVisible: false,
    lastValueVisible: false,
    priceFormat: {
      type: "volume"
    }
  });

  chartApi.priceScale("right").applyOptions({
    minimumWidth: CHART_RIGHT_SCALE_MIN_WIDTH,
    scaleMargins: {
      top: 0.06,
      bottom: 0.35
    }
  });

  chartApi.priceScale("volume").applyOptions({
    scaleMargins: {
      top: 0.78,
      bottom: 0
    },
    visible: false
  });

  if (ENABLE_CHART_HOVER && !chartCrosshairBound) {
    chartApi.subscribeCrosshairMove((param) => {
      renderChartHover(param);
    });
    chartCrosshairBound = true;
  }

  if (!chartResizeObserver) {
    chartResizeObserver = new ResizeObserver(() => {
      if (!chartApi) return;
      const { width, height } = getChartViewportSize();
      if (width > 0 && height > 0) {
        chartApi.applyOptions({ width, height });
        chartApi.timeScale().fitContent();
      }
    });
    chartResizeObserver.observe(el.chartCanvas);
  }

  applySeriesVisibility();
  return true;
}

function applySeriesVisibility() {
  if (chartSeries.market) chartSeries.market.applyOptions({ visible: Boolean(seriesVisibility.market) });
  if (chartSeries.volatility) {
    chartSeries.volatility.applyOptions({ visible: Boolean(seriesVisibility.volatility) });
  }
  if (chartSeries.volume) chartSeries.volume.applyOptions({ visible: Boolean(seriesVisibility.volume) });

  renderLegendToggles();
  if (!seriesVisibility.market && !seriesVisibility.volatility) {
    hideChartHover();
  }
}

function applyChartLocalization() {
  if (!chartApi) return;
  chartApi.applyOptions({
    localization: {
      locale: locale(),
      timeFormatter: (time) => formatChartTime(time, true),
      priceFormatter: (price) => formatCompactK(Number(price), "")
    },
    timeScale: {
      tickMarkFormatter: (time) => formatChartTime(time, false)
    }
  });
}

function renderChart() {
  const t = text();

  if (!ensureChart()) {
    setChartMessage(t.chartLibMissing, true);
    return;
  }

  const market = Array.isArray(chartState.lines?.market) ? chartState.lines.market : [];
  const volatility = Array.isArray(chartState.candles?.volatility) ? chartState.candles.volatility : [];
  const volume = Array.isArray(chartState.volume) ? chartState.volume : [];

  const hasAny = market.length || volatility.length || volume.length;
  if (!hasAny) {
    chartSeries.market.setData([]);
    chartSeries.volatility.setData([]);
    chartSeries.volume.setData([]);
    hideChartHover();
    setChartMessage(t.chartNoData, true);
    return;
  }

  setChartMessage("", false);

  chartSeries.market.setData(market);
  chartSeries.volatility.setData(volatility);
  chartSeries.volume.setData(
    volume.map((point) => ({
      time: point.time,
      value: point.value,
      color: point.isUp ? "rgba(255, 95, 109, 0.52)" : "rgba(90, 162, 255, 0.52)"
    }))
  );

  applySeriesVisibility();
  chartApi.timeScale().fitContent();
}

function applyStaticText() {
  const t = text();
  document.documentElement.lang = currentLang;
  document.title = t.title;

  el.title.textContent = t.title;
  el.subtitle.textContent = t.subtitle;
  el.refreshBtn.textContent = t.refresh;
  el.searchInput.placeholder = t.searchPlaceholder;
  if (el.listLengthSelect) {
    const optShort = el.listLengthSelect.querySelector("option[value='short']");
    const optMedium = el.listLengthSelect.querySelector("option[value='medium']");
    const optFull = el.listLengthSelect.querySelector("option[value='full']");
    if (optShort) optShort.textContent = t.listLenShort;
    if (optMedium) optMedium.textContent = t.listLenMedium;
    if (optFull) optFull.textContent = t.listLenFull;
    el.listLengthSelect.value = listLengthMode;
  }
  updateExportButtonState();
  if (el.exportScaleLabel) {
    el.exportScaleLabel.textContent = t.exportScaleLabel;
  }
  if (el.exportScaleInput) {
    el.exportScaleInput.min = String(EXPORT_IMAGE_SCALE_MIN);
    el.exportScaleInput.max = String(EXPORT_IMAGE_SCALE_MAX);
    el.exportScaleInput.step = String(EXPORT_IMAGE_SCALE_STEP);
    el.exportScaleInput.setAttribute("aria-label", `${t.exportScaleLabel} export`);
    el.exportScaleInput.value = formatExportScaleValue(exportImageScale);
  }

  refreshTableHeaderState();

  el.chartTitle.textContent = t.chartTitle;
  el.chartSubtitle.textContent = t.chartSubtitle;
  if (el.chartLoadingText) {
    el.chartLoadingText.textContent = t.chartLoadingLive;
  }
  el.legendMarket.textContent = t.legendMarket;
  el.legendVolatility.textContent = t.legendVolatility;
  el.legendVolume.textContent = t.legendVolume;

  el.rangeBtn24h.textContent = t.range24h;
  el.rangeBtn7d.textContent = t.range7d;
  el.rangeBtn30d.textContent = t.range30d;
  if (el.mobileSortAvgBtn) {
    el.mobileSortAvgBtn.textContent = t.mobileSortAvg;
  }
  if (el.mobileSortDefaultBtn) {
    el.mobileSortDefaultBtn.textContent = t.mobileSortDefault;
  }

  updateRangeButtons();
  applyChartLocalization();
  renderLegendToggles();
  syncSourceGuardText();
}

function renderAll() {
  renderMeta();
  refreshTableHeaderState();
  renderRows(buildMergedRows(), el.slowRows);
  renderSelectedServerTag();
}

async function loadRates() {
  if (ratesInFlight) return ratesInFlight;

  ratesInFlight = (async () => {
    try {
      setRatesError("");

      const payload = await fetchJsonWithFallback("/api/rates");
      responseState = {
        dataUpdatedAt: payload.dataUpdatedAt || null,
        isStale: Boolean(payload.isStale),
        modes: {
          slow: payload.modes?.slow || { rows: [] },
          fast: payload.modes?.fast || { rows: [] }
        },
        notes: {
          crossRuleFallback: Array.isArray(payload?.notes?.crossRuleFallback)
            ? payload.notes.crossRuleFallback
            : []
        }
      };

      ensureSelectedServerExists();
      renderAll();
    } catch (error) {
      console.error("loadRates failed:", error);
      setRatesError(text().errLoad);
    }
  })().finally(() => {
    ratesInFlight = null;
  });

  return ratesInFlight;
}

async function loadChart() {
  setChartLoading(true, text().chartLoadingLive);

  const requestKey = `${selectedServerCode}|${chartRange}`;
  if (chartInFlight && chartInFlightKey === requestKey) {
    return chartInFlight;
  }

  chartInFlightKey = requestKey;
  const requestToken = ++chartRequestToken;

  const job = (async () => {
    try {
      const payload = await fetchJsonWithFallback(
        `/api/chart?serverCode=${encodeURIComponent(selectedServerCode)}&range=${encodeURIComponent(
          chartRange
        )}`
      );

      if (requestToken !== chartRequestToken) return;

      chartState = {
        updatedAt: payload.updatedAt || null,
        isStale: Boolean(payload.isStale),
        lines: {
          market: Array.isArray(payload.lines?.market) ? payload.lines.market : []
        },
        candles: {
          volatility: Array.isArray(payload.candles?.volatility) ? payload.candles.volatility : []
        },
        volume: Array.isArray(payload.volume) ? payload.volume : [],
        freshness: normalizeFreshness(payload.freshness)
      };

      renderChartMeta();
      renderChart();
    } catch (error) {
      if (requestToken !== chartRequestToken) return;
      console.error("loadChart failed:", error);

      chartState = {
        ...chartState,
        isStale: true
      };

      renderChartMeta();
      if (!(chartState.lines?.market?.length || chartState.candles?.volatility?.length || chartState.volume?.length)) {
        setChartMessage(text().chartErr, true);
        hideChartHover();
      }
    }
  })();

  chartInFlight = job;
  return job.finally(() => {
    if (requestToken === chartRequestToken) {
      setChartLoading(false);
    }
    if (chartInFlight === job) {
      chartInFlight = null;
      chartInFlightKey = "";
    }
  });
}

async function refreshAll() {
  const beforeServer = selectedServerCode;
  await Promise.allSettled([loadRates(), loadChart()]);

  if (selectedServerCode !== beforeServer) {
    await loadChart();
  }
}

function bindEvents() {
  el.searchInput.addEventListener("input", (event) => {
    searchQuery = event.target.value || "";
    renderAll();
  });

  el.refreshBtn.addEventListener("click", () => {
    refreshAll();
  });

  el.exportListBtn?.addEventListener("click", () => {
    exportMergedListImage();
  });
  el.copyListBtn?.addEventListener("click", () => {
    copyMergedListImage();
  });

  el.exportScaleInput?.addEventListener("change", (event) => {
    const next = normalizeExportScale(event.target.value);
    exportImageScale = next;
    saveExportImageScale(next);
    event.target.value = formatExportScaleValue(next);
    updateExportButtonState();
  });

  el.listLengthSelect?.addEventListener("change", (event) => {
    const nextMode = String(event.target.value || "");
    if (!LIST_LENGTH_MODES.has(nextMode)) return;
    listLengthMode = nextMode;
    saveListLengthMode(nextMode);
    applyListLengthMode();
  });

  el.langSelect.addEventListener("change", (event) => {
    const nextLang = event.target.value;
    if (!I18N[nextLang]) return;

    currentLang = nextLang;
    saveLang(nextLang);

    applyStaticText();
    renderAll();
    renderChartMeta();
    renderChart();

    if (el.errorText.style.display === "block") {
      el.errorText.textContent = text().errLoad;
    }
  });

  const rangeButtons = [el.rangeBtn24h, el.rangeBtn7d, el.rangeBtn30d];
  for (const button of rangeButtons) {
    button.addEventListener("click", () => {
      const nextRange = button.dataset.range;
      if (!nextRange || nextRange === chartRange) return;
      chartRange = nextRange;
      updateRangeButtons();
      loadChart();
    });
  }

  const toggleButtons = [el.toggleMarket, el.toggleVolatility, el.toggleVolume].filter(Boolean);
  for (const button of toggleButtons) {
    button.addEventListener("click", () => {
      const key = button.dataset.seriesToggle;
      if (!key || !(key in seriesVisibility)) return;
      seriesVisibility[key] = !seriesVisibility[key];
      saveSeriesVisibility();
      applySeriesVisibility();
    });
  }

  el.chartCanvas?.addEventListener("mouseleave", () => {
    hideChartHover();
  });

  const sortableHeaders = [
    [el.slowHeadServer, SORT_KEY_SERVER],
    [el.slowHeadRateLt1m, SORT_KEY_RATE_LT1M],
    [el.slowHeadRateGt1m, SORT_KEY_RATE_GT1M],
    [el.slowHeadFast, SORT_KEY_FAST],
    [el.slowHeadChange, SORT_KEY_CHANGE]
  ];

  for (const [header, sortKey] of sortableHeaders) {
    if (!header) continue;

    header.addEventListener("click", () => {
      toggleTableSort(sortKey);
      renderAll();
    });

    header.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleTableSort(sortKey);
      renderAll();
    });
  }

  el.mobileSortAvgBtn?.addEventListener("click", () => {
    tableSort = {
      key: SORT_KEY_AVG,
      direction: "desc"
    };
    renderAll();
  });

  el.mobileSortDefaultBtn?.addEventListener("click", () => {
    tableSort = {
      key: SORT_KEY_SERVER,
      direction: null
    };
    renderAll();
  });
}

async function init() {
  bootLoaderStartedAt = Date.now();
  bootLoaderBaseText = text().loadingInit;
  bootLoaderDotCount = 0;
  startBootLoaderTicker();
  setBootProgress(4, text().loadingInit);

  el.langSelect.value = currentLang;
  applyListLengthMode();
  applyStaticText();
  setBootProgress(14, text().loadingInit);
  hideChartHover();
  bindSourceGuard();
  bindEvents();
  setBootProgress(28, text().loadingRates);

  const initialServer = selectedServerCode;
  const ratesJob = loadRates().finally(() => {
    setBootProgress(62, text().loadingChart);
  });
  const chartJob = loadChart().finally(() => {
    setBootProgress(86, text().loadingDone);
  });

  await Promise.allSettled([ratesJob, chartJob]);
  if (selectedServerCode !== initialServer) {
    await loadChart();
  }

  setBootProgress(100, text().loadingDone);
  await hideBootLoader();

  setInterval(() => {
    loadRates();
  }, AUTO_REFRESH_RATES_MS);

  setInterval(() => {
    loadChart();
  }, AUTO_REFRESH_CHART_MS);
}

init();
