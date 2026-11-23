// js/config.js
// ---------------------------------------------------------------------------
// All tunable settings in one place. Firebase settings get added here in M2.
// ---------------------------------------------------------------------------

// Minimum time (ms) a post must stay on screen before an answer is accepted.
// Phase 1: people have to actually READ each statement for exposure to count
// (Hassan & Barber 2021 showed each statement for 4 s).
export const MIN_VIEW_MS_P1 = 4000;

// Phase 2: short lock only to stop accidental double taps / skipping ahead.
export const MIN_VIEW_MS_P2 = 1000;

// Key used to save progress in the browser, so a sleeping phone or closed tab
// resumes where it left off. Bump the suffix to force everyone to start fresh.
export const STORAGE_KEY = "echo-exp-v1";

// Test mode: open the site with ?dev=1 to get a "continue" button on the
// waiting screen and a reset button. Without Firebase (M1) this is the only
// way to move from Phase 1 to Phase 2.
export const DEV = new URLSearchParams(location.search).has("dev");
