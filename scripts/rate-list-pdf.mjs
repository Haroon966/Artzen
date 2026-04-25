/**
 * Parses Artzen rate-list PDFs (pdftotext -layout) into code → price, material, dimensions.
 * Used by generate-from-local-folders.mjs — keep Node ESM.
 */

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");

/** PDF typos: wrong code printed → real SKU used in filenames */
const CODE_FIX = new Map([
  [61, 6], // Mashallah — PDF says 61, files use 06
]);

function pdftotext(pdfPath) {
  if (!fs.existsSync(pdfPath)) return "";
  try {
    return execFileSync("pdftotext", ["-layout", pdfPath, "-"], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch {
    return "";
  }
}

function normalizeText(s) {
  return String(s)
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00ad/g, "")
    .replace(/\ufb01/g, "fi")
    .replace(/\ufb02/g, "fl");
}

export function findRateListPdf(categoryDir) {
  const dir = path.join(PROJECT_ROOT, "public", "images", "products", categoryDir);
  if (!fs.existsSync(dir)) return null;
  const exact = path.join(dir, `Rate List ${categoryDir}.pdf`);
  if (fs.existsSync(exact)) return exact;
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch {
    return null;
  }
  const hit = files.find((f) => /^Rate List.*\.pdf$/i.test(f));
  return hit ? path.join(dir, hit) : null;
}

/**
 * Split a PDF text line into left / right catalog columns (two items per row).
 */
function splitTwoColumns(line) {
  const trimmed = line.trim();
  const parts = trimmed.split(/\s{3,}/);
  if (parts.length >= 2) {
    return [parts[0].trim(), parts.slice(1).join("   ").trim()];
  }
  return [trimmed, ""];
}

function accumulateColumnText(blockLines) {
  const left = [];
  const right = [];
  for (const line of blockLines) {
    const [a, b] = splitTwoColumns(line);
    left.push(a);
    if (b) right.push(b);
  }
  return { left: left.join("\n"), right: right.join("\n") };
}

/**
 * Build selectable size/price options from one PDF item block (matches rate list wording).
 * @returns {Array<{ id: string, label: string, price: number, material?: string }>}
 */
export function extractSizeOptionsFromSideText(sideText, materialFromPdf) {
  const mat = materialFromPdf?.trim() || undefined;
  const text = sideText.replace(/\r/g, "\n");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const body = lines.filter((l) => !/^Name:/i.test(l));

  const candidates = [];

  const push = (label, price) => {
    if (!label || price == null || Number.isNaN(price)) return;
    const L = label.replace(/\s+/g, " ").trim();
    if (!L) return;
    candidates.push({ label: L, price, material: mat });
  };

  // A) Inline: Size: … - Rs. N
  const reDashRs = /Size:\s*([^\n]+?)\s*-\s*Rs\.?\s*([\d,]+)/gi;
  let m;
  while ((m = reDashRs.exec(text)) !== null) {
    push(m[1].trim(), parseInt(m[2].replace(/,/g, ""), 10));
  }

  // B) Large … Rs. N
  const reLarge = /(?:^|\n)\s*Large\s+([^\n]+?)\s+Rs\.?\s*([\d,]+)/gi;
  while ((m = reLarge.exec(text)) !== null) {
    push("Large " + m[1].trim(), parseInt(m[2].replace(/,/g, ""), 10));
  }

  // C) Size: … Rs. N (no dash; avoid duplicating A)
  const reDirectRs = /Size:\s*([^\n]+?)\s+Rs\.?\s*([\d,]+)/gi;
  while ((m = reDirectRs.exec(text)) !== null) {
    if (/\s-\s*Rs\.?\s*[\d,]+/i.test(m[0])) continue;
    push(m[1].replace(/\s*-\s*$/,"").trim(), parseInt(m[2].replace(/,/g, ""), 10));
  }

  // D) Size: (no Rs on line) → next line Rs. only
  for (let i = 0; i < body.length; i++) {
    const line = body[i];
    const sz = line.match(/^Size:\s*(.+)$/i);
    if (!sz || /rs\.?\s*[\d,]+/i.test(line)) continue;
    const next = body[i + 1];
    if (next && /^\s*Rs\.?\s*([\d,]+)\s*$/i.test(next) && !/^Size:/i.test(next)) {
      push(sz[1].trim(), parseInt(next.match(/([\d,]+)/)[1].replace(/,/g, ""), 10));
      i++;
    }
  }

  // E) Wall-style: Size line, Material line, Rs line (Size not caught above)
  let pendingSize = null;
  for (let i = 0; i < body.length; i++) {
    const line = body[i];
    const sz = line.match(/^Size:\s*(.+)$/i);
    if (sz && !/rs\.?\s*[\d,]+/i.test(line)) {
      pendingSize = sz[1].trim();
      continue;
    }
    if (/^Material\s*:/i.test(line)) continue;
    const rs = line.match(/^Rs\.?\s*([\d,]+)\s*$/i);
    if (rs && pendingSize) {
      push(pendingSize, parseInt(rs[1].replace(/,/g, ""), 10));
      pendingSize = null;
    }
  }

  const seen = new Set();
  const out = [];
  for (const c of candidates) {
    const k = `${c.label}|${c.price}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ id: `s${out.length}`, label: c.label, price: c.price, material: c.material });
  }
  return out;
}

/** Everything after Name/Material in a PDF block — sizes, tiers, and Rs amounts. */
function extractPricingDetail(sideText) {
  const t = sideText.trim();
  if (!t) return undefined;
  let rest = t.replace(/^Name:\s*[^\n]+/im, "").replace(/^Material\s*:\s*[^\n]+/im, "");
  rest = rest
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" · ");
  rest = rest.replace(/\s+/g, " ").trim();
  if (!rest) return undefined;
  if (rest.length > 480) rest = rest.slice(0, 477) + "…";
  return rest;
}

function sideTextToEntry(sideText) {
  const t = sideText.trim();
  if (!t) return null;
  const nameM = t.match(/Name:\s*([^\n]+)/i);
  const matM = t.match(/Material\s*:\s*([^\n]+)/i);
  const rsAll = [...t.matchAll(/Rs\.?\s*([\d,]+)/gi)].map((m) =>
    parseInt(m[1].replace(/,/g, ""), 10)
  );
  if (!rsAll.length) return null;
  const price = Math.min(...rsAll);
  const sizeParts = [];
  function stripRsFromSizeChunk(chunk) {
    return chunk
      .replace(/\s*-\s*Rs\.?\s*[\d,]+/gi, "")
      .replace(/\s*Rs\.?\s*[\d,]+/gi, "")
      .replace(/\s*-\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  for (const ln of t.split("\n")) {
    const s = ln.trim();
    if (/^Size:\s*/i.test(s)) {
      sizeParts.push(stripRsFromSizeChunk(s.replace(/^Size:\s*/i, "").trim()));
    } else if (/^Large\b/i.test(s) && /\d/.test(s)) {
      sizeParts.push(stripRsFromSizeChunk(s));
    }
  }
  let dimensions = sizeParts.filter(Boolean).join(" · ");
  if (dimensions.length > 220) dimensions = dimensions.slice(0, 217) + "…";
  const pricingDetail = extractPricingDetail(t);
  const matStr = matM ? matM[1].trim() : undefined;
  let sizeOptions = extractSizeOptionsFromSideText(t, matStr);
  if (sizeOptions.length === 0) {
    sizeOptions = [
      {
        id: "s0",
        label: dimensions && dimensions.length > 0 ? dimensions : "Standard",
        price,
        material: matStr,
      },
    ];
  }
  return {
    price,
    material: matStr,
    dimensions: dimensions || undefined,
    pricingDetail,
    sizeOptions,
    name: nameM ? nameM[1].trim() : undefined,
  };
}

/**
 * Parses two-column rate lists (Wall Decoration, Islamic Calligraphy, Premium Islamic).
 * @returns {Map<number, { price: number, material?: string, dimensions?: string, pricingDetail?: string, sizeOptions?: Array<{id:string,label:string,price:number,material?:string}>, name?: string }>}
 */
export function parseStandardRateListPdf(pdfPath) {
  const text = normalizeText(pdftotext(pdfPath));
  const lines = text
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length);
  const map = new Map();
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const dual = line.match(/^Code\s*#:\s*(\d+)\s+Code\s*#:\s*(\d+)\s*$/i);
    const single = !dual && line.match(/^Code\s*#:\s*(\d+)\s*$/i);
    if (dual) {
      let c1 = parseInt(dual[1], 10);
      let c2 = parseInt(dual[2], 10);
      if (CODE_FIX.has(c1)) c1 = CODE_FIX.get(c1);
      if (CODE_FIX.has(c2)) c2 = CODE_FIX.get(c2);
      i++;
      const block = [];
      while (i < lines.length && !/^\s*Code\s*#:/i.test(lines[i].trim())) {
        block.push(lines[i]);
        i++;
      }
      const { left, right } = accumulateColumnText(block);
      const e1 = sideTextToEntry(left);
      const e2 = sideTextToEntry(right);
      if (e1) map.set(c1, e1);
      if (e2) map.set(c2, e2);
      continue;
    }
    if (single) {
      let c = parseInt(single[1], 10);
      if (CODE_FIX.has(c)) c = CODE_FIX.get(c);
      i++;
      const block = [];
      while (i < lines.length && !/^\s*Code\s*#:/i.test(lines[i].trim())) {
        block.push(lines[i]);
        i++;
      }
      const { left } = accumulateColumnText(block);
      const e = sideTextToEntry(left);
      if (e) map.set(c, e);
      continue;
    }
    i++;
  }
  return map;
}

export function parseVintageRateListPdf(pdfPath) {
  const text = normalizeText(pdftotext(pdfPath));
  const matM = text.match(/Material\s*:\s*([^\n]+)/i);
  const prices = [...text.matchAll(/Rs\.?\s*([\d,]+)/gi)].map((m) =>
    parseInt(m[1].replace(/,/g, ""), 10)
  );
  const sizeParts = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (/^Size:\s*/i.test(t)) {
      sizeParts.push(
        t
          .replace(/^Size:\s*/i, "")
          .replace(/\s*-\s*Rs\.?\s*[\d,]+/gi, "")
          .trim()
      );
    }
  }
  const material = matM ? matM[1].trim() : "Black Acrylic + Golden Mirror + Sticker";
  const minPrice = prices.length ? Math.min(...prices) : 5999;
  const dimensions =
    sizeParts.length > 0
      ? sizeParts.join(" · ")
      : "12 × 18 in · 16 × 24 in";
  const pricingParts = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    const m = t.match(/^Size:\s*(.+?)\s*-\s*Rs\.?\s*([\d,]+)\s*$/i);
    if (m) pricingParts.push(`${m[1].trim()} — Rs. ${m[2]}`);
  }
  const pricingDetail =
    pricingParts.length > 0 ? pricingParts.join(" · ") : `${dimensions} — from Rs. ${minPrice}`;
  const sizeOptions = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    const m = t.match(/^Size:\s*(.+?)\s*-\s*Rs\.?\s*([\d,]+)\s*$/i);
    if (m) {
      sizeOptions.push({
        id: `s${sizeOptions.length}`,
        label: m[1].trim(),
        price: parseInt(m[2].replace(/,/g, ""), 10),
        material,
      });
    }
  }
  if (sizeOptions.length === 0) {
    sizeOptions.push({ id: "s0", label: dimensions, price: minPrice, material });
  } else {
    sizeOptions.sort((a, b) => a.price - b.price);
    sizeOptions.forEach((o, i) => {
      o.id = `s${i}`;
    });
  }
  return {
    price: minPrice,
    material,
    dimensions,
    pricingDetail,
    sizeOptions,
  };
}

/** Leading numeric SKU in filenames like "2001 - Bear.jpg", "010 - Kalma.jpg" */
export function extractLeadingSkuFromBasename(basename) {
  const m = String(basename).match(/^\s*(\d+)\s*-\s*/);
  if (!m) return null;
  return parseInt(m[1], 10);
}
