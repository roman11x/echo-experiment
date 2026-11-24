// js/stats.js
// ---------------------------------------------------------------------------
// Turns participant documents into the class results. Shared by the results
// page (live chart) and the admin page (CSV export), so both always agree.
// ---------------------------------------------------------------------------

import { STATEMENTS } from "../data/statements.js";

const byId = Object.fromEntries(STATEMENTS.map((s) => [s.id, s]));

// A participant counts only if they did BOTH phases and weren't late.
export const isIncluded = (p) => !p.late && p.stage === "done";

// One row per Phase-2 judgment, with everything needed for analysis.
// `repeated` = the statement belongs to the set this person saw in Phase 1.
export function rows(participants) {
  const out = [];
  for (const p of participants) {
    const seenSet = p.list === "A" ? "X" : "Y";
    for (const [id, ans] of Object.entries(p.p2 || {})) {
      const s = byId[id];
      if (!s) continue;                                   // unknown id (statements changed)
      out.push({
        uid: p.id, list: p.list, late: !!p.late, included: isIncluded(p),
        id, set: s.set, truth: s.truth, known: s.known,
        repeated: s.set === seenSet,
        p1: p.p1?.[id]?.a ?? "",                          // like/skip if it was in Phase 1
        answer: ans.a, saidTrue: ans.a === "true", rt: ans.rt,
      });
    }
  }
  return out;
}

// % judged "true" for any subset of rows; also returns n (number of judgments).
function pct(rs) {
  const n = rs.length;
  const t = rs.filter((r) => r.saidTrue).length;
  return { pct: n ? Math.round((100 * t) / n) : null, n };
}

// The numbers the results page shows.
export function summarize(participants) {
  const included = participants.filter(isIncluded);
  const rs = rows(included);
  const rep = rs.filter((r) => r.repeated), neu = rs.filter((r) => !r.repeated);
  return {
    nIncluded: included.length,
    nExcluded: participants.length - included.length,
    nDone: participants.filter((p) => p.stage === "done").length,
    nJoined: participants.length,
    repeated: pct(rep),
    new: pct(neu),
    // Fazio-style breakdown: 4 groups, each with repeated vs new.
    byCell: [
      ["unknown", true,  "Likely unknown"],   // Figure 4 order: Truth (unknown, known),
      ["known",   true,  "Likely known"],
      ["unknown", false, "Likely unknown"],   // then Falsehood (unknown, known)
      ["known",   false, "Likely known"],
    ].map(([k, t, label]) => ({
      label, key: `${k}-${t}`,
      repeated: pct(rep.filter((r) => r.known === k && r.truth === t)),
      new: pct(neu.filter((r) => r.known === k && r.truth === t)),
    })),
  };
}

// CSV text from rows (Excel / Sheets friendly).
export function toCSV(rs) {
  const cols = ["uid", "list", "late", "included", "id", "set", "truth", "known", "repeated", "p1", "answer", "saidTrue", "rt"];
  const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  return [cols.join(","), ...rs.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
