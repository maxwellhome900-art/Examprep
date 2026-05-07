/**
 * Smoke-check a running CertPrep API (default http://127.0.0.1:3001).
 * Usage: node scripts/api-smoke.mjs [baseUrl]
 */
import { validateExams } from "../lib/validateExams.js";

const base = (process.argv[2] || "http://127.0.0.1:3001").replace(/\/$/, "");

async function getJson(path) {
  const url = `${base}${path}`;
  const res = await fetch(url);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { res, body, url };
}

let failed = false;
function fail(msg) {
  failed = true;
  console.error(msg);
}

const health = await getJson("/api/health");
if (!health.res.ok || health.body?.ok !== true) {
  fail(`GET ${health.url} expected { ok: true }, got HTTP ${health.res.status} body=${JSON.stringify(health.body)}`);
} else {
  console.log(`OK ${health.url}`);
}

const examsRes = await getJson("/api/exams");
if (!examsRes.res.ok || !Array.isArray(examsRes.body)) {
  fail(`GET ${examsRes.url} expected JSON array, got HTTP ${examsRes.res.status}`);
} else {
  const exams = examsRes.body;
  console.log(`OK ${examsRes.url} (${exams.length} exam(s))`);
  const { ok, errors } = validateExams(exams);
  if (!ok) {
    errors.forEach((e) => fail(`  schema: ${e}`));
  }
}

if (failed) {
  process.exit(1);
}
console.log("Smoke checks passed.");
