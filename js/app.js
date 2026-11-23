// js/app.js
// ---------------------------------------------------------------------------
// The participant flow:  intro → Phase 1 → wait → Phase 2 intro → Phase 2 → done
//
// M1 (this version) keeps everything in the browser (localStorage).
// M2 will add Firebase: the same state object gets saved to Firestore, and
// the presenters' admin page decides when Phase 2 opens.
// ---------------------------------------------------------------------------

import { STATEMENTS, POSTERS } from "../data/statements.js";
import { MIN_VIEW_MS_P1, MIN_VIEW_MS_P2, STORAGE_KEY, DEV } from "./config.js";
import { showPost } from "./feed.js";

const main = document.getElementById("main");       // where screens are drawn
const counter = document.getElementById("counter"); // "01 / 16" in the header
const byId = Object.fromEntries(STATEMENTS.map((s) => [s.id, s])); // id -> statement

// ---------------------------------------------------------------------------
// Randomness: Fisher–Yates shuffle using the browser's crypto RNG.
// ---------------------------------------------------------------------------
function shuffle(arr) {
  const a = [...arr];                                // copy, never mutate the input
  for (let i = a.length - 1; i > 0; i--) {
    const r = crypto.getRandomValues(new Uint32Array(1))[0]; // unbiased random number
    const j = r % (i + 1);                           // pick a position 0..i
    [a[i], a[j]] = [a[j], a[i]];                     // swap
  }
  return a;
}

// ---------------------------------------------------------------------------
// State: created once per participant, then saved after every answer.
// ---------------------------------------------------------------------------
function newState() {
  // M1: list chosen by coin flip. M2: a Firestore transaction keeps A/B even.
  const list = crypto.getRandomValues(new Uint8Array(1))[0] % 2 ? "A" : "B";
  const seenSet = list === "A" ? "X" : "Y";          // which half is shown in Phase 1
  const ids = STATEMENTS.map((s) => s.id);
  return {
    list,                                            // "A" | "B"
    order1: shuffle(ids.filter((id) => byId[id].set === seenSet)), // 16 Phase-1 posts
    order2: shuffle(ids),                            // all 32 posts for Phase 2
    p1: {},                                          // id -> { a: "like"|"skip", rt }
    p2: {},                                          // id -> { a: "true"|"not", rt }
    stage: "intro",                                  // where to resume
  };
}

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
};
const save = (st) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); } catch { /* private mode: keep going */ }
};

let state = load() || newState();                    // resume if we have saved progress

// ---------------------------------------------------------------------------
// Small screen helpers
// ---------------------------------------------------------------------------
const pad = (n) => String(n).padStart(2, "0");
function setCounter(i, total) { counter.textContent = total ? `${pad(i)} / ${total}` : ""; }

// Draw a simple "notice" card with an optional button; resolves when clicked.
function notice({ title, body, button }) {
  setCounter(0, 0);
  main.innerHTML = `
    <section class="post notice">
      <h1>${title}</h1>
      ${body}
      ${button ? `<button class="btn btn-like btn-wide" id="go">${button}</button>` : ""}
    </section>`;
  return button
    ? new Promise((res) => main.querySelector("#go").addEventListener("click", res, { once: true }))
    : Promise.resolve();
}

// ---------------------------------------------------------------------------
// Run one phase: show the posts in `order` that are not answered yet.
// ---------------------------------------------------------------------------
async function runPhase(phase, order, minMs) {
  const answers = state[phase];
  main.className = `feed mode-${phase}`;             // lets CSS colour the swipe labels per phase
  for (let i = 0; i < order.length; i++) {
    const id = order[i];
    if (answers[id]) continue;                       // already answered (resumed session)
    setCounter(i + 1, order.length);
    const { answer, rt } = await showPost({
      root: main,
      statement: byId[id],
      poster: POSTERS[i % POSTERS.length],           // poster by feed position
      mode: phase,
      minMs,
    });
    answers[id] = { a: answer, rt };                 // record the answer
    save(state);                                     // persist after EVERY answer
  }
}

// ---------------------------------------------------------------------------
// Wrapped: the participant's own numbers, shown only on their own phone.
// ---------------------------------------------------------------------------
function wrapped() {
  const seen = new Set(state.order1);                // the posts from Phase 1
  let seenTrue = 0, newTrue = 0;
  for (const [id, { a }] of Object.entries(state.p2)) {
    if (a !== "true") continue;
    if (seen.has(id)) seenTrue++; else newTrue++;
  }
  const nSeen = state.order1.length;                 // 16
  const nNew = state.order2.length - nSeen;          // 16
  return `
    <div class="wrapped">
      <div class="wrap-row">
        <span class="wrap-label">Posts you'd seen before</span>
        <span class="wrap-num">${seenTrue}<small> / ${nSeen}</small></span>
        <span class="wrap-sub">marked true</span>
      </div>
      <div class="wrap-row">
        <span class="wrap-label">New posts</span>
        <span class="wrap-num">${newTrue}<small> / ${nNew}</small></span>
        <span class="wrap-sub">marked true</span>
      </div>
    </div>
    <p class="muted small">Half of all posts were true and half were false, in both groups.
    With only 16 posts each, one person's gap is mostly chance; the class result is what counts.</p>`;
}

// ---------------------------------------------------------------------------
// The flow, as a small state machine driven by state.stage.
// ---------------------------------------------------------------------------
async function run() {
  if (state.stage === "intro") {
    await notice({
      title: "Welcome to Echo 👋",
      body: `<p>You're one of our first users. Your feed has ${state.order1.length} posts.</p>
             <p>For each post, tap <b>♥ Interesting</b> if you find it interesting, or
             <b>Not interesting</b> if you don't. You can also swipe.</p>
             <p class="muted small">Each post needs a few seconds before you can answer. Take the time to read it.</p>`,
      button: "Start scrolling",
    });
    state.stage = "p1"; save(state);
  }

  if (state.stage === "p1") {
    await runPhase("p1", state.order1, MIN_VIEW_MS_P1);
    state.stage = "wait"; save(state);
  }

  if (state.stage === "wait") {
    await notice({
      title: "You're all caught up ✓",
      body: `<p>Thanks! Keep this page (or just scan the same QR code later).
             We'll continue at the end of the class.</p>
             <p class="muted small">Please use the same phone and browser, not a private tab.</p>`,
      button: DEV ? "Continue to part 2 (test mode)" : null,
    });
    if (!DEV) return;                                // M1: wait here; M2: Firestore opens Phase 2
    state.stage = "p2intro"; save(state);
  }

  if (state.stage === "p2intro") {
    await notice({
      title: "Part 2",
      body: `<p>Now you'll see ${state.order2.length} posts. Some are true and some are false.</p>
             <p>For each post, choose <b class="t-true">✓ True</b> or <b class="t-false">✕ Not true</b>.</p>`,
      button: "Start",
    });
    state.stage = "p2"; save(state);
  }

  if (state.stage === "p2") {
    await runPhase("p2", state.order2, MIN_VIEW_MS_P2);
    state.stage = "done"; save(state);
  }

  if (state.stage === "done") {
    await notice({
      title: "Done, thank you! 🎉",
      body: `${wrapped()}<p>Look up at the screen for the class results.</p>`,
      button: null,
    });
  }
}

// Test-mode reset button (only with ?dev=1).
if (DEV) {
  const b = document.getElementById("reset");
  b.hidden = false;
  b.addEventListener("click", () => { localStorage.removeItem(STORAGE_KEY); location.reload(); });
}

run();
