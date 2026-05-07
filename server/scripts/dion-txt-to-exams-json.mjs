import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseAllDionExamsFromText } from "../lib/dionTxtParser.js";
import { validateExams } from "../lib/validateExams.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const txtPath = path.join(__dirname, "..", "data", "data.txt");
const outPath = path.join(__dirname, "..", "data", "exams.json");

const txt = await readFile(txtPath, "utf-8");
const exams = parseAllDionExamsFromText(txt);
if (!exams.length) {
  console.error("No exams parsed. Check server/data/data.txt format and size.");
  process.exit(1);
}

for (const exam of exams) {
  exam.title = String(exam.title).trim() || "Linux+ Practice Exam";
  exam.description = "";
}

const check = validateExams(exams);
if (!check.ok) {
  console.error("Exam validation failed:");
  check.errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

await writeFile(outPath, JSON.stringify({ exams }, null, 2), "utf-8");
const counts = exams.map((e) => e.questions.length);
console.log(`Wrote ${outPath} — ${exams.length} exam(s), questions per exam: ${counts.join(", ")}`);
