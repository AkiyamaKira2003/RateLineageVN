import { chromium } from "playwright-core";

const port = Number(process.argv[2] || 9666);
const cdpBase = `http://127.0.0.1:${port}`;

function short(text, n = 120) {
  if (!text) return "";
  return text.length > n ? `${text.slice(0, n - 1)}…` : text;
}

async function run() {
  const browser = await chromium.connectOverCDP(cdpBase);
  try {
    const contexts = browser.contexts();
    const allPages = contexts.flatMap((ctx) => ctx.pages());
    const barotemPages = allPages.filter((p) => /barotem\.com/i.test(p.url()));

    if (!barotemPages.length) {
      console.log("NO_BAROTEM_TAB");
      return;
    }

    for (let i = 0; i < barotemPages.length; i += 1) {
      const p = barotemPages[i];
      const title = await p.title().catch(() => "");
      console.log(
        JSON.stringify(
          {
            index: i,
            title: short(title),
            url: p.url(),
          },
          null,
          2
        )
      );
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("INSPECT_FAILED", err?.message || String(err));
  process.exitCode = 1;
});

