function clean(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

export function parseDionExamSection(sectionRaw, examNum) {
  if (!sectionRaw || typeof sectionRaw !== "string" || sectionRaw.trim().length < 50) return null;

  const lines = sectionRaw.split(/\r?\n/);
  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^Question \d+\s*$/.test(lines[i].trim())) starts.push(i);
  }
  if (starts.length === 0) return null;

  let num = examNum;
  if (num == null || num === "") {
    const titleMatch = sectionRaw.match(/Full-length Practice Exam\s+(\d+)/i);
    num = titleMatch ? titleMatch[1] : "1";
  }
  num = String(num);

  const questions = [];

  for (let s = 0; s < starts.length; s++) {
    const from = starts[s];
    const to = s + 1 < starts.length ? starts[s + 1] : lines.length;
    const L = lines.slice(from, to).map((l) => l.trimEnd());
    const mNum = L[0]?.trim().match(/^Question (\d+)\s*$/);
    if (!mNum) continue;

    const idxCA = L.findIndex((l) => l.trim() === "Correct answer");
    const idxOE = L.findIndex((l) => l.trim() === "Overall explanation");
    if (idxCA < 0 || idxOE < 0) continue;

    const correct = L[idxCA + 1]?.trim();
    if (!correct) continue;

    const slice = L.slice(2, idxCA);
    while (slice.length && slice[slice.length - 1].trim() === "") slice.pop();

    let qEnd = -1;
    for (let j = 0; j < slice.length; j++) {
      if (slice[j].includes("?")) qEnd = j;
    }

    let question;
    let wrongBefore = [];
    if (qEnd >= 0) {
      question = clean(slice.slice(0, qEnd + 1).join("\n"));
      wrongBefore = slice.slice(qEnd + 1).map((x) => x.trim()).filter(Boolean);
    } else {
      let splitAt = -1;
      for (let k = Math.max(0, slice.length - 3); k < slice.length; k++) {
        const cand = slice.slice(k);
        if (
          cand.length &&
          cand.every((line) => line && line.length < 200 && !line.includes("Which of the following"))
        ) {
          splitAt = k;
          break;
        }
      }
      if (splitAt > 0) {
        question = clean(slice.slice(0, splitAt).join("\n"));
        wrongBefore = slice.slice(splitAt).map((x) => x.trim()).filter(Boolean);
      } else {
        question = clean(slice.filter(Boolean).join("\n"));
        wrongBefore = [];
      }
    }

    const wrongAfter = L.slice(idxCA + 2, idxOE)
      .map((l) => l.trim())
      .filter(
        (l) =>
          l &&
          !/^Your answer is (incorrect|correct)\.?$/i.test(l) &&
          l !== "Correct answer",
      );

    const wrongPool = [...wrongBefore, ...wrongAfter]
      .map((o) => o.trim())
      .filter((o) => o && o.toLowerCase() !== correct.toLowerCase());
    const seenW = new Set();
    const wrongs = [];
    for (const o of wrongPool) {
      const k = o.toLowerCase();
      if (seenW.has(k)) continue;
      seenW.add(k);
      wrongs.push(o);
      if (wrongs.length >= 3) break;
    }
    if (wrongs.length < 3) continue;

    const base = [correct, wrongs[0], wrongs[1], wrongs[2]];
    const rot = Number(mNum[1]) % 4;
    const options = [...base.slice(rot), ...base.slice(0, rot)];
    const correctIndex = options.findIndex((o) => o.toLowerCase() === correct.toLowerCase());
    if (correctIndex < 0) continue;

    const explanation = clean(
      L.slice(idxOE + 1)
        .join(" ")
        .split(/OBJ\.\s*\d/i)[0] ?? "",
    );

    questions.push({
      id: `e${num}-q${mNum[1]}`,
      question,
      options,
      correctIndex,
      explanation: explanation || "See course materials for details.",
    });
  }

  if (questions.length === 0) return null;

  return {
    id: `linux-plus-imported-exam-${num}`,
    title: `Linux+ Practice Exam ${num}`,
    description: "",
    timeMinutes: Math.max(60, Math.round(questions.length * 1.1)),
    questions,
  };
}

export function parseAllDionExamsFromText(raw) {
  if (!raw || typeof raw !== "string" || raw.trim().length < 50) return [];

  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);

  const lines = raw.split(/\r?\n/);
  const boundaries = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].trim().match(/^Full-length Practice Exam (\d+)\s*-\s*Results\s*$/i);
    if (m) boundaries.push({ i, num: m[1] });
  }

  if (boundaries.length === 0) {
    const one = parseDionExamSection(raw, null);
    return one?.questions?.length ? [one] : [];
  }

  const exams = [];
  for (let b = 0; b < boundaries.length; b++) {
    const from = boundaries[b].i;
    const to = b + 1 < boundaries.length ? boundaries[b + 1].i : lines.length;
    const chunk = lines.slice(from, to).join("\n");
    const parsed = parseDionExamSection(chunk, boundaries[b].num);
    if (parsed?.questions?.length) exams.push(parsed);
  }
  return exams;
}

export function parseDionExamExport(raw) {
  const all = parseAllDionExamsFromText(raw);
  return all[0] ?? null;
}
