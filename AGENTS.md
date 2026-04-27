# AGENTS.md — RateLineageVN

> **KIẾN THỨC BẮT BUỘC CHO MỌI AGENT LÀM VIỆC VỚI PROJECT NÀY**

---

## Đây là gì?

**RateLineageVN** = Kira Rate Adena VN Lineage Classic
- Web app realtime theo dõi **giá Adena** trên **28 server Lineage M Korea**
- Tech: Vanilla JS + Node.js (không framework, không bundler)
- Port: 3100

## Tài liệu đầy đủ

Đọc **`PROJECT-DOCUMENTATION.md`** cho toàn bộ chi tiết kỹ thuật.

---

## Cấu trúc nhanh

```
RateLineageVN/
├── index.html              # UI (HTML + CSS inline, ~1400 lines)
├── app.js                  # Frontend logic (~2300 lines)
├── local-dev-server.js     # HTTP server (port 3100)
├── api/
│   ├── rates.js            # /api/rates handler (~1450 lines)
│   ├── chart.js            # /api/chart handler (~540 lines)
│   ├── server-config.js    # 28 server definitions
│   ├── price-config.js     # Deduction % config
│   ├── barotem-client.js  # Barotem scraping với relay
│   └── gamebit-client.js  # Gamebit scraping với relay
├── cache/
│   └── rates-snapshot.json # Fallback cache khi API fail
└── PROJECT-DOCUMENTATION.md # Tài liệu kỹ thuật đầy đủ
```

---

## Commands nhanh

```bash
# Chạy dev server
node local-dev-server.js

# Test API
Invoke-RestMethod http://127.0.0.1:3100/api/rates
Invoke-RestMethod "http://127.0.0.1:3100/api/chart?serverCode=S1&range=24h"
```

---

## ⚠️ CẢNH BÁO: ĐỪNG NHẦM VỚI PROJECT KHÁC!

### Cách phân biệt nhanh

| Nói về... | → Project đúng |
|-----------|----------------|
| Rate, Adena, Lineage, Lineage Classic, 28 server, S1-S28, KRW→VND, barotem, gamebit, adreamer | **RateLineageVN** ← Đây |
| QuickText, KIRA-LC, hotkey, Roblox | `../QuickText/` |
| AIBrain, context, session, analyze, neuron, projects | `../AIBrain/` |

### Hậu quả khi nhầm

- **Đọc QuickText code** → Sẽ tìm function không tồn tại, context sai hoàn toàn
- **Dùng AIBrain** → Sẽ nhầm project manifest, session index không đúng
- **Tìm file không đúng** → RateLineageVN KHÔNG có `bin/`, `lib/`, `mcp-server.mjs`

---

## Quy tắc bắt buộc khi làm việc

### 1. GitNexus — Impact Analysis

**TRƯỚC KHI SỬA bất kỳ function nào:**

```bash
npx gitnexus analyze
gitnexus_impact({target: "functionName", direction: "upstream"})
```

**BÁO CÁO blast radius trước khi edit.**

### 2. GitNexus — Detect Changes

**TRƯỚC KHI COMMIT:**

```bash
gitnexus_detect_changes()
```

**Kiểm tra chỉ ảnh hưởng symbols mong đợi.**

### 3. Rename — Dùng gitnexus_rename

**KHÔNG BAO GIỜ** dùng find-and-replace để rename function.

```bash
gitnexus_rename({oldName: "oldFn", newName: "newFn", scope: "file"})
```

### 4. Đọc tài liệu TRƯỚC

| Cần biết... | Đọc file |
|-------------|----------|
| Toàn bộ kiến trúc | `PROJECT-DOCUMENTATION.md` |
| Frontend flow | `app.js` (đặc biệt dòng 1-400, 1025-1300, 1770-2140) |
| Backend API | `api/rates.js`, `api/chart.js` |
| Cấu hình servers | `api/server-config.js` |
| Cấu hình giá | `api/price-config.js` |

---

## Thêm Server Mới (Checklist)

1. [ ] Thêm vào `api/server-config.js`: `SERVER_ORDER[]`
2. [ ] Tìm `opt1` từ barotem.com (URL filter)
3. [ ] Test: `Invoke-RestMethod "http://127.0.0.1:3100/api/chart?serverCode=S29&range=24h"`
4. [ ] Chạy `gitnexus_detect_changes()` sau khi sửa

---

## Thêm Ngôn Ngữ Mới

1. [ ] Thêm vào `I18N` object trong `app.js` (~dòng 49)
2. [ ] Thêm `<option>` vào `<select id="langSelect">` trong `index.html`
3. [ ] Thêm vào `LANG_TO_LOCALE` trong `app.js`

---

## Data Flow

```
Browser (index.html + app.js)
    ↓ fetch /api/rates, /api/chart
local-dev-server.js (port 3100)
    ↓
api/rates.js ← barotem.com, gamebit.co.kr, adreamer.now, er-api.com
api/chart.js ← adreamer.now, gamebit.co.kr, er-api.com
```

---

## Key State Objects

```javascript
// Frontend state (app.js)
responseState = {
  dataUpdatedAt, isStale,
  modes: { slow: {rows}, fast: {rows} },
  notes: { crossRuleFallback }
}

chartState = {
  updatedAt, isStale,
  lines: { market },
  candles: { volatility },
  volume,
  freshness: { lagMinutes, isDelayed }
}
```

---

## External APIs

| Source | URL | Used by |
|--------|-----|---------|
| Barotem | barotem.com/product/lists/2382r902 | api/rates.js |
| Gamebit | gamebit.co.kr/v3_get_chart_data.php | api/chart.js |
| Adreamer | game.adreamer.now/api/prices/adena | api/rates.js, api/chart.js |
| FX | open.er-api.com/v6/latest/KRW | api/rates.js, api/chart.js |

---

*Nếu cần thêm function mới, đọc PROJECT-DOCUMENTATION.md trước.*
