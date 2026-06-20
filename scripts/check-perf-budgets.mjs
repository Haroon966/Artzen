#!/usr/bin/env node
/**
 * Fails if Lighthouse JSON in perf/ violates thresholds in perf/budgets.json.
 * Run after: npm run perf:lighthouse
 */
import fs from "fs";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = nodePath.dirname(fileURLToPath(import.meta.url));
const ROOT = nodePath.join(__dirname, "..");
const PERF = nodePath.join(ROOT, "perf");
const BUDGETS_PATH = nodePath.join(PERF, "budgets.json");

function numAudit(audits, id) {
  const v = audits[id]?.numericValue;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function main() {
  const raw = fs.readFileSync(BUDGETS_PATH, "utf8");
  const budgets = JSON.parse(raw);
  const routes = budgets.routes;
  if (!routes || typeof routes !== "object") {
    console.error("perf/budgets.json: missing routes");
    process.exit(1);
  }

  let failed = false;
  for (const [file, cfg] of Object.entries(routes)) {
    const jsonPath = nodePath.join(PERF, file);
    if (!fs.existsSync(jsonPath)) {
      console.error(`Missing Lighthouse report: ${jsonPath}\nRun: npm run perf:lighthouse`);
      process.exit(1);
    }
    const report = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const audits = report.audits ?? {};
    const score = report.categories?.performance?.score;
    const seoScore = report.categories?.seo?.score;
    const lcp = numAudit(audits, "largest-contentful-paint");
    const tbt = numAudit(audits, "total-blocking-time");
    const cls = numAudit(audits, "cumulative-layout-shift");
    const label = cfg.label ?? file;

    const issues = [];
    if (typeof cfg.minPerformanceScore === "number") {
      if (typeof score !== "number" || score < cfg.minPerformanceScore) {
        issues.push(
          `performance score ${score == null ? "—" : score.toFixed(2)} < min ${cfg.minPerformanceScore}`
        );
      }
    }
    if (typeof cfg.minSeoScore === "number") {
      if (typeof seoScore !== "number" || seoScore < cfg.minSeoScore) {
        issues.push(
          `SEO score ${seoScore == null ? "—" : seoScore.toFixed(2)} < min ${cfg.minSeoScore}`
        );
      }
    }
    if (typeof cfg.maxLcpMs === "number" && lcp != null && lcp > cfg.maxLcpMs) {
      issues.push(`LCP ${Math.round(lcp)}ms > max ${cfg.maxLcpMs}ms`);
    }
    if (typeof cfg.maxTbtMs === "number" && tbt != null && tbt > cfg.maxTbtMs) {
      issues.push(`TBT ${Math.round(tbt)}ms > max ${cfg.maxTbtMs}ms`);
    }
    if (typeof cfg.maxCls === "number" && cls != null && cls > cfg.maxCls) {
      issues.push(`CLS ${cls.toFixed(3)} > max ${cfg.maxCls}`);
    }

    if (issues.length) {
      failed = true;
      console.error(`[perf budget] ${label}: ${issues.join("; ")}`);
    } else {
      console.log(
        `[perf budget] OK ${label} perf=${score == null ? "—" : Math.round(score * 100)} seo=${seoScore == null ? "—" : Math.round(seoScore * 100)} LCP=${lcp == null ? "—" : Math.round(lcp)}ms TBT=${tbt == null ? "—" : Math.round(tbt)}ms CLS=${cls == null ? "—" : cls.toFixed(3)}`
      );
    }
  }

  if (failed) {
    console.error("\nUpdate perf/budgets.json after intentional regressions, or fix performance.");
    process.exit(1);
  }
}

main();
