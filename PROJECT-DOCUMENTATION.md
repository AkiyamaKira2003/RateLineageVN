# PROJECT-DOCUMENTATION — RateLineageVN

> **Mục đích:** Tài liệu kỹ thuật đầy đủ cho AI agent và developer đọc 1 lần hiểu toàn bộ hệ thống.

---

## 1. Tổng Quan Dự Án

### 1.1 Dự án là gì?

**RateLineageVN** = Kira Rate Adena VN Lineage Classic

- **Web app realtime** theo dõi **giá Adena** trên **28 server Lineage M Korea**
- Tính năng chính: Bảng giá Adena, biểu đồ 24h/7d/30d, xuất ảnh Full HD
- Đối tượng: Người chơi Lineage M Việt Nam mua bán Adena

### 1.2 Ecosystem — XGum

RateLineageVN là một phần của **XGum workspace** — ecosystem quản lý tools Lineage M.

```
XGum Workspace (c:\Users\esket\Downloads\Tools\XGum\)
├── RateLineageVN/     # Giá Adena realtime (28 servers)
│   ├── index.html     # UI + CSS
│   ├── app.js         # Frontend logic
│   ├── api/           # Server-side API
│   └── cache/         # Data cache
└── XGUM.html          # Adena Calculator standalone
    └── tools/XGum/    # Single HTML calculator
```

**XGum components:**


| Component       | Path              | Mô tả                       |
| --------------- | ----------------- | --------------------------- |
| RateLineageVN   | `RateLineageVN/`  | Web app giá Adena realtime  |
| XGUM Calculator | `XGUM.html`       | Standalone Adena calculator |
| Barotem Module  | (trong QuickText) | Rate lookup tool            |


**Relationship:**

- RateLineageVN cung cấp **giá Adena realtime** từ 28 servers
- XGUM Calculator dùng dữ liệu để **tính toán exchange rate**
- Barotem module (QuickText) dùng cho **quick lookup**

### 1.2 Thông số kỹ thuật


| Thông số          | Giá trị                                               |
| ----------------- | ----------------------------------------------------- |
| **Port**          | 3100                                                  |
| **Stack**         | Vanilla JS + Node.js (không framework, không bundler) |
| **Frontend**      | Single HTML file + app.js                             |
| **Backend**       | 2 API endpoint: `/api/rates` và `/api/chart`          |
| **Chart library** | lightweight-charts (TradingView)                      |
| **Data source**   | barotem.com, gamebit.co.kr, adreamer.now, er-api.com  |
| **Cache**         | In-memory + file fallback                             |


### 1.3 Data Flow toàn hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                  │
│   index.html + app.js (Frontend — Vanilla JS, ~2300 lines)     │
└──────────────┬────────────────────────────────────────────────┘
               │ fetch /api/rates, /api/chart
               ▼
┌─────────────────────────────────────────────────────────────────┐
│              local-dev-server.js (port 3100)                    │
│   HTTP server đơn giản, serve static files + API routing     │
└──────────────┬────────────────────────────────────────────────┘
               │
       ┌───────┴──────────┐
       ▼                  ▼
┌──────────────┐    ┌──────────────┐
│ api/rates.js │    │api/chart.js  │
│ Bảng giá     │    │Biểu đồ      │
│ 28 servers   │    │OHLCV data   │
└───────┬──────┘    └──────┬───────┘
        │                  │
        ▼                  ▼
┌──────────────────────────────────────────────────────────────┐
│                   EXTERNAL APIs                               │
├──────────────────────────────────────────────────────────────┤
│ barotem.com     → Giá Adena KRW (listing pages)             │
│ gamebit.co.kr   → Market change %, biểu đồ OHLCV            │
│ adreamer.now   → Fallback giá, history data                │
│ er-api.com     → Tỷ giá KRW → VND                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Cấu Trúc File

```
RateLineageVN/
│
├── index.html                    # UI (HTML + CSS inline, 1400+ lines)
│   ├── Boot loader (loading animation)
│   ├── Hero section (logo, title, toolbar)
│   ├── Rates table (28 server rows)
│   └── Chart panel (line + candlestick + volume)
│
├── app.js                       # Frontend logic (~2300 lines)
│   ├── Constants (I18N, storage keys, config)
│   ├── Element refs
│   ├── State management
│   ├── API fetching
│   ├── Table rendering
│   ├── Chart management
│   ├── Image export
│   └── Event binding
│
├── local-dev-server.js          # HTTP server Node.js (~140 lines)
│   ├── Static file serving
│   ├── API routing (/api/rates, /api/chart)
│   ├── HTML meta injection
│   └── OG image headers
│
├── api/
│   ├── rates.js                # /api/rates (~1450 lines)
│   │   ├── Barotem scraping
│   │   ├── Mode (slow/fast) fetching
│   │   ├── Candidate selection
│   │   ├── Market change resolution
│   │   ├── FX conversion (KRW→VND)
│   │   └── Caching + fallback
│   │
│   ├── chart.js                # /api/chart (~540 lines)
│   │   ├── Adreamer history (market line)
│   │   ├── Gamebit candles + volume
│   │   ├── FX conversion
│   │   └── Freshness detection
│   │
│   ├── server-config.js        # 28 server definitions
│   │   ├── SERVER_ORDER (S1→S28)
│   │   ├── SERVER_ALIAS
│   │   └── MODE_CONFIG (slow/fast)
│   │
│   ├── price-config.js         # Deduction config
│   │   ├── getDeductionProfiles()
│   │   ├── Deduction % per mode (lt1m/gt1m/fast)
│   │   └── Env var overrides
│   │
│   ├── barotem-client.js       # Barotem fetch với relay + cookie session
│   │   ├── fetchBarotemJson()
│   │   ├── Session cookie management
│   │   └── Relay fallback chain
│   │
│   └── gamebit-client.js       # Gamebit fetch với relay
│       ├── fetchGamebitJson()
│       └── Relay fallback chain
│
├── cache/
│   └── rates-snapshot.json    # Fallback cache khi API fail
│
├── vendor/
│   └── lightweight-charts.standalone.production.js
│
├── logoKRLC.png
├── dev-server.out.log
├── tunnel.err.log
├── share-message.txt
├── public-url.txt
├── CLAUDE.md                   # Context file cho AI agent
├── AGENTS.md                   # Agent rules (duplicated context)
└── PROJECT-DOCUMENTATION.md   # (file này)
```

---

## 3. Frontend — `app.js` Chi Tiết

### 3.1 Cấu trúc file

File `app.js` (~2300 lines) chia thành các phần:


| Dòng      | Phần                    | Mô tả                                   |
| --------- | ----------------------- | --------------------------------------- |
| 1-245     | Constants & Config      | Storage keys, I18N, default values      |
| 246-360   | State & Globals         | Module-level state variables            |
| 361-376   | API Base Config         | Multi-origin API fallback               |
| 377-395   | LocalStorage Helpers    | Load/save lang, series, export scale    |
| 396-470   | List length mode        | CSS-based height control                |
| 471-485   | i18n helpers            | `text()`, `locale()`                    |
| 486-540   | Boot loader             | Loading animation + progress            |
| 541-575   | Chart time utilities    | Timezone, Unix resolution               |
| 576-670   | Formatting              | Date, number, currency, rate formatting |
| 671-740   | Sort logic              | Table column sorting                    |
| 741-810   | Sort header rendering   | Arrow indicators                        |
| 811-860   | Table header state      | Sort state management                   |
| 861-870   | Cell creation helper    | DOM cell factory                        |
| 871-885   | Error + delay           | Error display, Promise helper           |
| 886-990   | Source guard            | DevTools blocking                       |
| 991-1024  | API fetch with fallback | Multi-base, retry, timeout              |
| 1025-1138 | Row building            | buildMergedRows(), filterRows()         |
| 1139-1280 | Table rendering         | renderRows(), DOM building              |
| 1281-1700 | Image export            | Canvas drawing, download, clipboard     |
| 1701-1769 | Meta rendering          | Status, stale, cross-fallback           |
| 1770-1880 | Chart management        | LightweightCharts setup                 |
| 1881-1920 | Series visibility       | Toggle market/vol/price                 |
| 1921-1940 | Chart localization      | Timezone-aware time formatting          |
| 1941-1970 | Chart data binding      | setData() calls                         |
| 1971-2030 | Static text             | applyStaticText()                       |
| 2031-2040 | Render orchestrator     | renderAll()                             |
| 2041-2070 | Rates loading           | loadRates()                             |
| 2071-2140 | Chart loading           | loadChart()                             |
| 2141-2144 | Refresh                 | refreshAll()                            |
| 2146-2260 | Event binding           | All DOM event handlers                  |
| 2263-2305 | Init                    | Boot sequence                           |


### 3.2 State object quan trọng

```javascript
// responseState — dữ liệu từ /api/rates
responseState = {
  dataUpdatedAt: "ISO timestamp",
  isStale: false,
  modes: {
    slow: { rows: [...] },   // Giá treo
    fast: { rows: [...] }    // Giá nhanh
  },
  notes: {
    crossRuleFallback: [     // Servers có slow < fast
      { serverCode, slowRatePer10kVnd, fastRefRatePer10kVnd }
    ]
  }
}

// chartState — dữ liệu từ /api/chart
chartState = {
  updatedAt: "ISO timestamp",
  isStale: false,
  lines: { market: [...] },        // Line chart
  candles: { volatility: [...] },   // Candlestick
  volume: [...],                  // Histogram
  freshness: { lagMinutes, isDelayed }
}
```

### 3.3 Key Functions để sửa khi thêm tính năng


| Function                       | Vị trí | Khi nào sửa                         |
| ------------------------------ | ------ | ----------------------------------- |
| `loadRates()`                  | ~2041  | Thay đổi cách fetch data            |
| `buildMergedRows()`            | ~1199  | Thay đổi cách merge slow/fast       |
| `renderRows()`                 | ~1277  | Thay đổi cách render bảng           |
| `renderChart()`                | ~1935  | Thay đổi cách render chart          |
| `buildMergedListImageCanvas()` | ~1433  | Thêm watermark, logo vào ảnh export |
| `fetchJsonWithFallback()`      | ~990   | Thêm API endpoint mới               |
| `I18N` object                  | ~49    | Thêm ngôn ngữ mới                   |


### 3.4 Cách thêm ngôn ngữ mới

**Bước 1:** Thêm vào `I18N` object (dòng ~49):

```javascript
const I18N = {
  vi: { /* ... */ },
  ko: { /* ... */ },
  en: { /* ... */ },
  fr: {                          // ← Thêm language code mới
    title: "Kira Rate Adena VN Lineage Classic",
    subtitle: "Realtime 100% - Updated 24/7",
    // ... copy from 'en' và translate
  }
};
```

**Bước 2:** Thêm option vào `<select id="langSelect">` trong `index.html`:

```html
<option value="vi">🇻🇳</option>
<option value="ko">🇰🇷</option>
<option value="en">🇺🇸</option>
<option value="fr">🇫🇷</option>  <!-- ← Thêm dòng này -->
```

**Bước 3:** Thêm vào `LANG_TO_LOCALE`:

```javascript
const LANG_TO_LOCALE = {
  vi: "vi-VN",
  ko: "ko-KR",
  en: "en-US",
  fr: "fr-FR"  // ← Thêm
};
```

### 3.5 Cách thêm cột mới vào bảng

**Bước 1:** Thêm vào `<thead>` trong `index.html`:

```html
<th style="text-align:right" id="slowHeadNewCol">New Column</th>
```

**Bước 2:** Thêm I18N key trong mỗi ngôn ngữ.

**Bước 3:** Set header state trong `refreshTableHeaderState()`.

**Bước 4:** Thêm cell vào `renderRows()`:

```javascript
tr.appendChild(createCell(newValue, "rate-cell", t.headNewCol));
```

### 3.6 Cách thêm series mới vào chart

**Bước 1:** Thêm series definition trong `ensureChart()`:

```javascript
chartSeries.newSeries = chartApi.addLineSeries({
  color: "#00ff00",
  lineWidth: 1,
  // ...
});
```

**Bước 2:** Thêm toggle button trong HTML + event binding.

**Bước 3:** Thêm state tracking + visibility logic.

---

## 4. Backend — API Chi Tiết

### 4.1 `/api/rates`

**Handler:** `api/rates.js` (~1450 lines)

**Input:** `GET /api/rates` (no params)

**Output:**

```json
{
  "source": {
    "provider": "market-feed",
    "category": "2382r902",
    "exchange": {
      "base": "KRW",
      "quote": "VND",
      "rate": 0.018234,
      "deductionProfiles": {
        "lt1m": { "deductionPercent": 19, "multiplier": 0.81 },
        "gt1m": { "deductionPercent": 15, "multiplier": 0.85 },
        "fast":  { "deductionPercent": 19, "multiplier": 0.81 }
      }
    },
    "crossRule": {
      "slowPrimary": "lowest slow >= fast",
      "slowFallback": "allow lowest slow < fast when no match"
    }
  },
  "dataUpdatedAt": "ISO timestamp",
  "isStale": false,
  "modes": {
    "slow": {
      "key": "slow",
      "rows": [
        {
          "serverCode": "S1",
          "order": 1,
          "serverNameKr": "데포로쥬",
          "opt1": "24487",
          "hasData": true,
          "ratePer10kVnd": 14785,
          "ratePer10kVndLt1m": 14785,
          "ratePer10kVndGt1m": 15785,
          "marketChangePct": 2.5,
          "crossRuleStatus": "matched",
          "skippedSlowCount": 0,
          "fastRefRatePer10kVnd": 14800
        },
        // ... 28 servers
      ]
    },
    "fast": { /* same structure */ }
  },
  "notes": {
    "crossRuleFallback": [
      { "serverCode": "S5", "slowRatePer10kVnd": 14200, "fastRefRatePer10kVnd": 14500 }
    ]
  }
}
```

### 4.2 `/api/chart`

**Handler:** `api/chart.js` (~540 lines)

**Input:** `GET /api/chart?serverCode=S1&range=24h`


| Query param  | Default | Values       |
| ------------ | ------- | ------------ |
| `serverCode` | S1      | S1→S28       |
| `range`      | 24h     | 24h, 7d, 30d |


**Output:**

```json
{
  "server": { "serverCode": "S1", "serverNameKr": "데포로쥬", "opt1": "24487" },
  "range": "24h",
  "currency": "VND",
  "updatedAt": "ISO timestamp",
  "isStale": false,
  "conversion": {
    "deductionPercent": 19,
    "multiplier": 0.81
  },
  "lines": {
    "market": [
      { "time": 1714252800, "value": 14850 },
      // ...
    ]
  },
  "candles": {
    "volatility": [
      { "time": 1714252800, "open": 14800, "high": 14900, "low": 14750, "close": 14850 }
    ]
  },
  "volume": [
    { "time": 1714252800, "value": 1234, "isUp": true }
  ],
  "freshness": {
    "latestPricePointAt": "ISO",
    "lagMinutes": 3,
    "isDelayed": false,
    "thresholdMinutes": 15,
    "source": "market"
  }
}
```

### 4.3 Key Functions trong `api/rates.js`


| Function                        | Dòng  | Mô tả                                 |
| ------------------------------- | ----- | ------------------------------------- |
| `refreshSnapshot()`             | ~1200 | Orchestrator — gọi tất cả fetch       |
| `fetchModeCandidates()`         | ~652  | Fetch tất cả listings từ Barotem      |
| `fetchTableWithRetry()`         | ~616  | Retry wrapper cho Barotem             |
| `buildCandidate()`              | ~166  | Parse 1 row → candidate object        |
| `selectFastCandidate()`         | ~257  | Chọn highest price sau outlier filter |
| `selectSlowCandidate()`         | ~268  | Chọn lowest price >= fast             |
| `filterFastOutliers()`          | ~219  | IQR + percentile filter               |
| `toVndPrice()`                  | ~851  | KRW → VND conversion                  |
| `fetchMarketChanges()`          | ~764  | Fetch gamebit + adreamer changes      |
| `fetchKrwToVndRate()`           | ~812  | Fetch tỷ giá từ er-api.com            |
| `applyAdreamerRateFallback()`   | ~920  | Fallback khi Barotem fail             |
| `buildModesFromCandidates()`    | ~974  | Compose final output                  |
| `scaleSnapshotForNewProfiles()` | ~491  | Re-scale khi deduction đổi            |


### 4.4 Key Functions trong `api/chart.js`


| Function                              | Dòng | Mô tả                         |
| ------------------------------------- | ---- | ----------------------------- |
| `fetchAdreamerMarketLine()`           | ~277 | Fetch market line từ adreamer |
| `fetchGamebitCandlesAndVolume()`      | ~306 | Fetch OHLCV từ gamebit        |
| `fetchKrwToVndRate()`                 | ~238 | Fetch tỷ giá (cache)          |
| `computeFreshness()`                  | ~90  | Detect data lag               |
| `scaleChartPayloadForNewMultiplier()` | ~143 | Re-scale khi deduction đổi    |


### 4.5 Barotem scraping flow

```
fetchTableWithRetry(mode, opt1)
    │
    ├─► fetchTable(mode, opt1)
    │       ├─► fetchBarotemJson(url, referer)
    │       │       ├─► Direct fetch (thử trước)
    │       │       ├─► Cookie session fetch (thử 2)
    │       │       └─► Relay fetch (Jina AI fallback)
    │       └─► Parse payload.rows[]
    │
    └─► buildCandidate(row)
            ├─► isTradableRow(row)         ← transaction_end = "0"
            ├─► parseRatePer10kKrw(row)   ← Regex "만당 X원"
            └─► parseKstTimestamp(row.reg_date)
```

### 4.6 Cross Rule Logic

**Mục đích:** Đảm bảo giá slow >= fast (bán treo phải cao hơn hoặc bằng giá mua nhanh)

```
Select Fast: highest price (sau IQR filter)
    ↓
Select Slow: lowest price ≥ fast price
    ↓
Nếu không tìm được (tất cả slow < fast):
    → Dùng lowest slow
    → Đánh dấu crossRuleStatus = "fallback_below_fast"
    → Ghi vào notes.crossRuleFallback
```

---

## 5. Cấu Hình

### 5.1 Server Config (`api/server-config.js`)

28 servers Lineage M Korea:

```javascript
const SERVER_ORDER = [
  { serverCode: "S1",  order: 1,  serverNameKr: "데포로쥬", opt1: "24487" },
  { serverCode: "S2",  order: 2,  serverNameKr: "켄라우헬", opt1: "24488" },
  // ... S3 → S28
  { serverCode: "S28", order: 28, serverNameKr: "발라카스", opt1: "26022" }
];
```

`**opt1**` = Barotem filter option cho server đó. Quan trọng khi thêm server mới.

### 5.2 Price Config (`api/price-config.js`)

```javascript
// Default deduction %
const DEFAULT_DEDUCTION_PERCENT_LT1M = 19;  // <1M Adena
const DEFAULT_DEDUCTION_PERCENT_GT1M = 15;  // >1M Adena
const DEFAULT_DEDUCTION_PERCENT_FAST = 19;  // Buy fast

// Env var overrides
RATELINEAGE_DEDUCTION_PERCENT_LT1M
RATELINEAGE_DEDUCTION_PERCENT_GT1M
RATELINEAGE_DEDUCTION_PERCENT_FAST

// Legacy (áp dụng cho tất cả)
RATELINEAGE_DEDUCTION_PERCENT
```

### 5.3 Barotem Relay Config

```bash
BAROTEM_RELAY_BASES=https://r.jina.ai/http://
BAROTEM_FETCH_TIMEOUT_MS=8500
BAROTEM_SESSION_TTL_MS=300000
```

### 5.4 Gamebit Relay Config

```bash
GAMEBIT_RELAY_BASES=https://r.jina.ai/http://
GAMEBIT_FETCH_TIMEOUT_MS=8500
GAMEBIT_RELAY_FIRST=1
```

---

## 6. Cách Thêm Server Mới

### Bước 1: Thêm vào `api/server-config.js`

```javascript
{ serverCode: "S29", order: 29, serverNameKr: "테스트서버", opt1: "99999" }
```

### Bước 2: Tìm `opt1` đúng

1. Vào [https://www.barotem.com/product/lists/2382r902](https://www.barotem.com/product/lists/2382r902)
2. Chọn server từ dropdown
3. Copy URL → tìm `opt1=XXXXX`

### Bước 3: Test

```bash
Invoke-RestMethod "http://127.0.0.1:3100/api/chart?serverCode=S29&range=24h"
```

---

## 7. Deployment / Operations

### 7.1 Chạy local

```bash
cd RateLineageVN
node local-dev-server.js
# → http://127.0.0.1:3100
```

### 7.2 Environment variables

```bash
# Deduction config
set RATELINEAGE_DEDUCTION_PERCENT_LT1M=19
set RATELINEAGE_DEDUCTION_PERCENT_GT1M=15
set RATELINEAGE_DEDUCTION_PERCENT_FAST=19

# Relay
set BAROTEM_RELAY_BASES=https://r.jina.ai/http://
set GAMEBIT_RELAY_BASES=https://r.jina.ai/http://

# Timeout tuning
set RATES_FETCH_TIMEOUT_MS=8500
set CHART_CACHE_TTL_MS=60000
set RATES_CACHE_TTL_MS=900000
```

### 7.3 Production deployment

```bash
# Build
node local-dev-server.js

# Với tunnel (public URL)
npx localtunnel --port 3100
# Hoặc dùng ngrok, cloudflare tunnel, etc.
```

---

## 8. External API Reference

### 8.1 Barotem (`barotem-client.js`)


| URL                                         | Method | Params                                       |
| ------------------------------------------- | ------ | -------------------------------------------- |
| `barotem.com/product/lists/2382r902`        | GET    | `sell=sell/buy`, `orderby=3/2`, `opt1=24487` |
| `barotem.com/product/productTable/2382r902` | POST   | `page=1`, `display=2`                        |


### 8.2 Gamebit (`gamebit-client.js`)


| URL                                      | Method | Params                                   |
| ---------------------------------------- | ------ | ---------------------------------------- |
| `gamebit.co.kr/v3_get_chart_data.php`    | GET    | `game=aden`, `sid=24487`, `type=min/day` |
| `gamebit.co.kr/jdata2/total_status.json` | GET    | —                                        |


### 8.3 Adreamer


| URL                                                             | Method | Params             |
| --------------------------------------------------------------- | ------ | ------------------ |
| `game.adreamer.now/api/prices/adena`                            | GET    | —                  |
| `game.adreamer.now/api/prices/adena/{server}/history?range=24h` | GET    | `range=24h/7d/30d` |


### 8.4 Exchange Rate


| URL                             | Method |
| ------------------------------- | ------ |
| `open.er-api.com/v6/latest/KRW` | GET    |


---

## 9. Architecture Notes

### 9.1 Caching strategy

- **Rates:** In-memory cache 15 phút. Fallback → disk snapshot.
- **Chart:** In-memory cache 60 giây. No disk fallback.
- **FX rate:** In-memory cache 10 phút.
- **Barotem session cookie:** 5 phút TTL.

### 9.2 Stale detection

```javascript
isStale = true khi:
  - Thiếu data (server count < 28)
  - Market change empty
  - Dùng fallback cache
  - Deduction profile changed
```

### 9.3 Data freshness

```javascript
freshness.isDelayed = lagMinutes >= 15

lagMinutes = (now - latestDataTimestamp) / 60000
```

### 9.4 Outlier filter (fast mode)

```javascript
// IQR + percentile method
Q1 = percentile(rates, 25)
Q3 = percentile(rates, 75)
IQR = Q3 - Q1
lowerBound = max(Q1 - 1.5*IQR, P5)
upperBound = min(Q3 + 1.5*IQR, P95)
```

---

## 10. Testing

### 10.1 Manual testing

```bash
# Test rates endpoint
Invoke-RestMethod http://127.0.0.1:3100/api/rates | ConvertTo-Json -Depth 10

# Test chart endpoint
Invoke-RestMethod "http://127.0.0.1:3100/api/chart?serverCode=S1&range=24h" | ConvertTo-Json -Depth 5

# Test all servers
1..28 | ForEach-Object {
  $r = Invoke-RestMethod "http://127.0.0.1:3100/api/chart?serverCode=S$_&range=24h"
  $r.server.serverCode + ": " + $r.lines.market.Count + " points, " + $r.candles.volatility.Count + " candles"
}
```

### 10.2 Check stale data

```bash
# Dùng browser DevTools → Console
fetch('/api/rates').then(r=>r.json()).then(d=>console.log(d.isStale, d.dataUpdatedAt, d.modes.slow.rows.length))
```

---

## 11. Những Thứ Quan Trọng Cần Nhớ

1. **KHÔNG dùng find/replace** để rename function — Dùng GitNexus
2. **Chạy impact analysis** trước khi sửa bất kỳ function nào
3. **Stale flag** — Frontend hiển thị warning khi data không fresh
4. **Cache fallback** — Khi API fail, dùng `cache/rates-snapshot.json`
5. `**opt1` là Barotem filter option** — Mỗi server có 1 opt1 khác nhau
6. **28 servers** — Không hardcode số lượng, dùng `SERVER_ORDER.length`
7. **Deduction thay đổi** → Tất cả cached data được re-scale tự động

---

## 12. Phân Biệt Project Nhanh


| Nói về...                                                         | → Project               |
| ----------------------------------------------------------------- | ----------------------- |
| Rate, Adena, Lineage, Lineage Classic, 28 server, S1-S28, KRW→VND | **RateLineageVN** ← Đây |
| QuickText, KIRA-LC, hotkey, Roblox                                | QuickText               |
| Context, session, AI Brain, analyze                               | AIBrain                 |


---

*Last updated: 2026-04-27*