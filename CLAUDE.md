

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **RateLineageVN** (982 symbols, 1677 relationships, 85 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources


| Resource                                       | Use for                                  |
| ---------------------------------------------- | ---------------------------------------- |
| `gitnexus://repo/RateLineageVN/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/RateLineageVN/clusters`       | All functional areas                     |
| `gitnexus://repo/RateLineageVN/processes`      | All execution flows                      |
| `gitnexus://repo/RateLineageVN/process/{name}` | Step-by-step execution trace             |


## CLI


| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |




## Ecosystem — XGum Workspace

RateLineageVN là một phần của **XGum workspace** — ecosystem quản lý tools Lineage M.

```
Tools/ (c:\Users\esket\Downloads\Tools\)
├── XGum/
│   ├── XGUM.html           # Standalone Adena Calculator
│   └── [other tools]       # Future tools
├── RateLineageVN/          # RateLineageVN - Web app giá Adena
├── QuickText/              # QuickText by Kira - Text overlay
└── AIBrain/                # AI Context Engine - Agent memory
```

**XGum ecosystem:**


| Project             | Path             | Mô tả                           |
| ------------------- | ---------------- | ------------------------------- |
| **RateLineageVN**   | `RateLineageVN/` | Web app giá Adena realtime      |
| **XGUM Calculator** | `XGum/XGUM.html` | Standalone Adena calculator     |
| **QuickText**       | `QuickText/`     | Desktop overlay cho text/hotkey |
| **AIBrain**         | `AIBrain/`       | AI Context Engine               |


**Đừng nhầm lẫn:**

- RateLineageVN + XGum = cùng ecosystem Lineage M
- QuickText = app riêng (không liên quan Lineage)
- AIBrain = tool quản lý context (không phải product)

---

# PROJECT: RateLineageVN

> **KIẾN THỨC VỀ DỰ ÁN NÀY — ĐỌC TRƯỚC KHI LÀM VIỆC**

## Đây là gì?

**RateLineageVN** = Kira Rate Adena VN Lineage Classic

- Web app realtime theo dõi **giá Adena** trên **28 server Lineage M Korea**
- Tech: Vanilla JS + Node.js (không framework)
- Port: 3100

## Đừng nhầm với dự án khác!

### ❌ KHÔNG ĐỌC CÁC FILE NÀY (chúng thuộc QuickText/AIBrain):

- `../QuickText/`* — QuickText app
- `../AIBrain/*` — AI Brain tool (trừ khi cần quản lý context)
- `../XGum/*` — XGum workspace (standalone, có file riêng)
- `KIRA-LC-QUICKTEXT-DOCUMENTATION.md` — Documentation cho QuickText

### ✅ CHỈ ĐỌC TRONG PROJECT NÀY:

- `app.js` — Frontend JS
- `index.html` — Frontend HTML + CSS
- `local-dev-server.js` — HTTP server
- `api/rates.js` — Rates API
- `api/chart.js` — Chart API
- `api/server-config.js` — 28 server config
- `api/price-config.js` — Deduction config
- `PROJECT-DOCUMENTATION.md` — Tài liệu đầy đủ

## Cấu trúc nhanh

```
RateLineageVN/
├── index.html         # UI + CSS + JS
├── app.js            # Frontend logic
├── local-dev-server.js  # Node HTTP server
├── api/
│   ├── rates.js      # Rates API handler
│   ├── chart.js      # Chart API handler
│   ├── server-config.js  # 28 servers
│   ├── price-config.js   # Deduction %
│   ├── barotem-client.js
│   └── gamebit-client.js
└── cache/
    └── rates-snapshot.json  # Fallback cache
```

## Khi nào cần chuyển project?


| User muốn...               | Chuyển sang   |
| -------------------------- | ------------- |
| Rate, Adena, Lineage       | **Ở lại đây** |
| QuickText, KIRA-LC, hotkey | `QuickText`   |
| AIBrain, context, session  | `AIBrain`     |


## Commands nhanh

```bash
# Chạy dev server
node local-dev-server.js

# Test API
Invoke-RestMethod http://127.0.0.1:3100/api/rates
```

