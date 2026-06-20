#!/usr/bin/env node
/**
 * Builds static export, serves `out/`, runs Lighthouse (mobile perf) on key URLs,
 * writes JSON under perf/ and refreshes perf/BASELINE.md.
 * Requires Chrome/Chromium available to Lighthouse.
 */
import { spawn } from "child_process";
import fs from "fs";
import http from "http";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = nodePath.dirname(fileURLToPath(import.meta.url));
const ROOT = nodePath.join(__dirname, "..");
const PORT = 4178;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const PERF = nodePath.join(ROOT, "perf");

const PAGES = [
  { out: "lighthouse-mobile-home.json", path: "/" },
  { out: "lighthouse-mobile-shop.json", path: "/shop/" },
  { out: "lighthouse-mobile-pdp-bear.json", path: "/products/bear/" },
];

function waitForHttpOk(url, maxMs = 60_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      http
        .get(url, (res) => {
          res.resume();
          if (res.statusCode && res.statusCode < 500) resolve();
          else if (Date.now() - start > maxMs) reject(new Error(`Timeout waiting for ${url}`));
          else setTimeout(tick, 400);
        })
        .on("error", () => {
          if (Date.now() - start > maxMs) reject(new Error(`Timeout waiting for ${url}`));
          else setTimeout(tick, 400);
        });
    };
    tick();
  });
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: false, ...opts });
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function runCapture(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    p.stderr?.on("data", (d) => {
      err += d.toString();
    });
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")}: ${err.slice(-400)}`))));
  });
}

function failedSeoAudits(report) {
  const refs = report.categories?.seo?.auditRefs ?? [];
  const audits = report.audits ?? {};
  return refs
    .filter((ref) => ref.weight > 0 && audits[ref.id]?.score !== 1)
    .map((ref) => ({
      id: ref.id,
      title: audits[ref.id]?.title ?? ref.id,
      score: audits[ref.id]?.score,
    }));
}

function summarize() {
  const rows = PAGES.map(({ out, path }) => {
    const file = nodePath.join(PERF, out);
    const h = JSON.parse(fs.readFileSync(file, "utf8"));
    const a = h.audits;
    const perfScore = h.categories?.performance?.score;
    const seoScore = h.categories?.seo?.score;
    return { out, path, perfScore, seoScore, a, report: h };
  });

  let md = `# Mobile Lighthouse baseline\n\n`;
  md += `Environment: static export served locally (\`npx serve out\`), Lighthouse 11.x, mobile emulation, performance + SEO categories.\n\n`;
  md += `Regenerate: \`npm run perf:lighthouse\` from the repo root.\n\n`;
  md += `| Page | Perf | SEO | LCP | TBT | CLS | Speed Index |\n|------|------|-----|-----|-----|-----|-------------|\n`;
  for (const { path: p, perfScore, seoScore, a } of rows) {
    const label = p === "/" ? "Home (/)" : p;
    const lcp = a["largest-contentful-paint"]?.displayValue ?? "—";
    const tbt = a["total-blocking-time"]?.displayValue ?? "—";
    const cls = a["cumulative-layout-shift"]?.displayValue ?? "—";
    const si = a["speed-index"]?.displayValue ?? "—";
    md += `| ${label} | ${perfScore != null ? Math.round(perfScore * 100) : "—"} | ${seoScore != null ? Math.round(seoScore * 100) : "—"} | ${lcp} | ${tbt} | ${cls} | ${si} |\n`;
  }

  md += `\n## SEO failures (score < 100)\n\n`;
  for (const { path: p, seoScore, report } of rows) {
    const label = p === "/" ? "Home (/)" : p;
    if (seoScore === 1) {
      md += `### ${label}\n- All SEO audits passed.\n\n`;
      continue;
    }
    const fails = failedSeoAudits(report);
    md += `### ${label}\n`;
    if (!fails.length) md += `- (score ${Math.round((seoScore ?? 0) * 100)} — no weighted failures listed)\n\n`;
    else {
      for (const f of fails) {
        md += `- **${f.id}** (${f.title}) — score ${f.score ?? "—"}\n`;
      }
      md += `\n`;
    }
  }

  md += `\n## LCP element (largest paint)\n\n`;
  for (const { path: p, a } of rows) {
    const label = p === "/" ? "Home (/)" : p;
    const node = a["largest-contentful-paint-element"]?.details?.items?.[0]?.node;
    md += `### ${label}\n`;
    if (node?.snippet) md += `- Snippet: \`${String(node.snippet).replace(/`/g, "'").slice(0, 240)}\`\n`;
    if (node?.selector) md += `- Selector: \`${node.selector}\`\n`;
    if (node?.nodeLabel) md += `- Label: ${node.nodeLabel}\n`;
    if (!node) md += `- (no node detail in this run)\n`;
    md += `\n`;
  }

  md += `## Long main-thread tasks (top entries)\n\n`;
  for (const { path: p, a } of rows) {
    const label = p === "/" ? "Home (/)" : p;
    const tasks = a["long-tasks"]?.details?.items?.slice(0, 6) ?? [];
    md += `### ${label}\n`;
    if (!tasks.length) md += `- (none listed)\n\n`;
    else {
      for (const r of tasks) {
        const url = r.url || "";
        const tail = url.length > 72 ? "…" + url.slice(-68) : url;
        md += `- ${(r.duration / 1000).toFixed(2)}s — ${tail || "unknown"}\n`;
      }
      md += `\n`;
    }
  }

  md += `\n---\n\nLocal runs are useful for **regression comparison**, not as a proxy for production CDN + HTTP/2 + edge caching.\n\n`;
  md += `**CI thresholds:** see [perf/BUDGETS.md](BUDGETS.md) and run \`npm run perf:check\` after \`npm run perf:lighthouse\`.\n`;
  fs.writeFileSync(nodePath.join(PERF, "BASELINE.md"), md, "utf8");
}

async function main() {
  fs.mkdirSync(PERF, { recursive: true });
  await run("npm", ["run", "build"], { cwd: ROOT, stdio: "inherit" });

  const serve = spawn("npx", ["--yes", "serve@14", "out", "-l", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
    detached: false,
  });

  try {
    await waitForHttpOk(`${ORIGIN}/`);
    const chromePath = process.env.CHROME_PATH?.trim();
    for (const { out, path: p } of PAGES) {
      const outPath = nodePath.join(PERF, out);
      const lhArgs = [
        "--yes",
        "lighthouse@11.6.0",
        `${ORIGIN}${p}`,
        "--only-categories=performance,seo",
        "--form-factor=mobile",
        "--screenEmulation.mobile=true",
        "--quiet",
        "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
        "--output=json",
        `--output-path=${outPath}`,
      ];
      if (chromePath) lhArgs.push(`--chrome-path=${chromePath}`);
      await runCapture("npx", lhArgs);
      console.log("Wrote", outPath);
    }
    summarize();
    console.log("Wrote", nodePath.join(PERF, "BASELINE.md"));
  } finally {
    serve.kill("SIGTERM");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
