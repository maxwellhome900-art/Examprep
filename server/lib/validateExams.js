/**
 * Structural checks for exam JSON (import + API load).
 * @param {unknown} exams
 * @returns {{ ok: boolean; errors: string[] }}
 */
export function validateExams(exams) {
  const errors = [];
  if (!Array.isArray(exams)) {
    errors.push("exams must be an array");
    return { ok: false, errors };
  }

  exams.forEach((exam, ei) => {
    const prefix = `Exam[${ei}]`;
    if (!exam || typeof exam !== "object") {
      errors.push(`${prefix}: not an object`);
      return;
    }
    if (typeof exam.id !== "string" || !exam.id.trim()) {
      errors.push(`${prefix}: missing or empty id`);
    }
    const qs = exam.questions;
    if (!Array.isArray(qs)) {
      errors.push(`${prefix} (${exam.id ?? "?"}): questions must be an array`);
      return;
    }
    if (qs.length === 0) {
      errors.push(`${prefix} (${exam.id ?? "?"}): questions array is empty`);
    }
    qs.forEach((q, qi) => {
      const qp = `${prefix} (${exam.id ?? "?"}) Q[${qi + 1}]`;
      if (!q || typeof q !== "object") {
        errors.push(`${qp}: not an object`);
        return;
      }
      if (typeof q.question !== "string" || !q.question.trim()) {
        errors.push(`${qp}: missing question text`);
      }
      const opts = q.options;
      if (!Array.isArray(opts) || opts.length !== 4) {
        errors.push(`${qp}: options must be an array of length 4 (got ${Array.isArray(opts) ? opts.length : typeof opts})`);
      } else {
        opts.forEach((o, oi) => {
          if (typeof o !== "string" || !String(o).trim()) {
            errors.push(`${qp}: option[${oi}] must be a non-empty string`);
          }
        });
      }
      const ci = q.correctIndex;
      if (!Number.isInteger(ci) || ci < 0 || ci > 3) {
        errors.push(`${qp}: correctIndex must be an integer 0–3 (got ${ci})`);
      }
    });
  });

  return { ok: errors.length === 0, errors };
}
