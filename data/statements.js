// data/statements.js
// ---------------------------------------------------------------------------
// The ONLY file you edit to swap in the real statements.
//
// Each statement has fixed metadata (never changes per participant):
//   id    – stable short id, used as the key when answers are saved
//   text  – what the participant reads
//   truth – true if the statement is actually true
//   known – "known" or "unknown": OUR estimate of whether students know it
//           (Fazio Exp. 2 did the same with 1980 norms; no knowledge check)
//   set   – "X" or "Y": the two halves used for counterbalancing.
//           List A shows set X in Phase 1 (so X = repeated, Y = new);
//           List B shows set Y in Phase 1 (so Y = repeated, X = new).
//
// Balance rule for the real items: each set should hold the same mix,
// i.e. 4 × (true, known), 4 × (true, unknown), 4 × (false, known),
// 4 × (false, unknown) — 16 per set, 32 total.
// ---------------------------------------------------------------------------

// Helper that builds one placeholder entry so the 32 lines below stay short.
const ph = (n, set, truth, known) => ({
  id: `s${String(n).padStart(2, "0")}`, // "s01", "s02", … – stable ids
  // Placeholder text: says which cell it belongs to, so testing is readable.
  text: `Placeholder post ${n}: a trivia statement of roughly this length goes here (${truth ? "true" : "false"}, ${known}).`,
  truth, // boolean
  known, // "known" | "unknown"
  set,   // "X" | "Y"
});

export const STATEMENTS = [
  // ---- Set X (16) ----
  ph(1, "X", true, "known"),   ph(2, "X", true, "known"),
  ph(3, "X", true, "known"),   ph(4, "X", true, "known"),
  ph(5, "X", true, "unknown"), ph(6, "X", true, "unknown"),
  ph(7, "X", true, "unknown"), ph(8, "X", true, "unknown"),
  ph(9, "X", false, "known"),  ph(10, "X", false, "known"),
  ph(11, "X", false, "known"), ph(12, "X", false, "known"),
  ph(13, "X", false, "unknown"), ph(14, "X", false, "unknown"),
  ph(15, "X", false, "unknown"), ph(16, "X", false, "unknown"),
  // ---- Set Y (16) ----
  ph(17, "Y", true, "known"),   ph(18, "Y", true, "known"),
  ph(19, "Y", true, "known"),   ph(20, "Y", true, "known"),
  ph(21, "Y", true, "unknown"), ph(22, "Y", true, "unknown"),
  ph(23, "Y", true, "unknown"), ph(24, "Y", true, "unknown"),
  ph(25, "Y", false, "known"),  ph(26, "Y", false, "known"),
  ph(27, "Y", false, "known"),  ph(28, "Y", false, "known"),
  ph(29, "Y", false, "unknown"), ph(30, "Y", false, "unknown"),
  ph(31, "Y", false, "unknown"), ph(32, "Y", false, "unknown"),
];

// Fictional Echo accounts that "post" the statements, so it reads like a feed.
// The poster is chosen by position in the feed, not by statement, so the same
// statement can appear from a different account in Phase 2 (only the text repeats).
export const POSTERS = [
  { name: "Maya Levi",    handle: "mayal",       color: "#1560d4" },
  { name: "Daily Trivia", handle: "dailytrivia", color: "#5b6b82" },
  { name: "Noam K.",      handle: "noamk",       color: "#2f7fe0" },
  { name: "Fact Corner",  handle: "factcorner",  color: "#3a4a63" },
  { name: "Shira B.",     handle: "shirab",      color: "#0e4fae" },
  { name: "Did You Know", handle: "didyouknow",  color: "#7a8799" },
  { name: "Tal Cohen",    handle: "talc",        color: "#1f6fcf" },
  { name: "Quick Facts",  handle: "quickfacts",  color: "#44546d" },
];
