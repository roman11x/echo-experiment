// js/app.js — the participant page
// ---------------------------------------------------------------------------
// Flow:  (wait for Phase 1 to open) → intro → Phase 1 → waiting screen
//        → (presenters open Phase 2) → Part 2 intro → Phase 2 → done
//
// Who is who: every phone signs in anonymously. Firebase remembers that
// login in the browser, so scanning the QR code again later (same phone,
// same browser) continues as the same participant.
// ---------------------------------------------------------------------------

import { STATEMENTS, POSTERS } from "../data/statements.js";
import { MIN_VIEW_MS_P1, MIN_VIEW_MS_P2, STORAGE_KEY } from "./config.js";
import { showPost, avatarHTML } from "./feed.js";
import {
  auth, db, sessionRef, participantRef, currentUser, signInAnonymously,
  getDoc, updateDoc, onSnapshot, runTransaction, serverTimestamp,
} from "./firebase.js";

const main = document.getElementById("main");       // where screens are drawn
const bar = document.getElementById("bar");         // answer buttons above the nav bar
const counter = document.getElementById("counter"); // "01 / 16" in the header
const byId = Object.fromEntries(STATEMENTS.map((s) => [s.id, s])); // id -> statement
const posterBy = Object.fromEntries(POSTERS.map((p) => [p.handle, p])); // handle -> account

let uid = null;       // this participant's anonymous Firebase id
let state = null;     // this participant's document (null = not joined yet)
let session = null;   // the live session document (phase, revealed, counts)

// ---------------------------------------------------------------------------
// Session listener: every phone follows the presenters' phase switch live.
// ---------------------------------------------------------------------------
const phaseWaiters = [];                                  // pending waitForPhase() calls
function waitForPhase(test) {
  // Resolves as soon as the session's phase passes `test` (maybe immediately).
  return new Promise((resolve) => {
    const check = () => session && test(session.phase);
    if (check()) return resolve(session.phase);
    phaseWaiters.push({ check, resolve });
  });
}
function onSessionChange() {
  for (let i = phaseWaiters.length - 1; i >= 0; i--) {   // wake up anyone waiting
    if (phaseWaiters[i].check()) { phaseWaiters[i].resolve(session.phase); phaseWaiters.splice(i, 1); }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function shuffle(arr) {                                   // Fisher–Yates with crypto RNG
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pad = (n) => String(n).padStart(2, "0");
const setCounter = (i, total) => { counter.textContent = total ? `${pad(i)} / ${total}` : ""; };
const mirror = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} };

// Save a change: Firestore first (queued offline if needed), plus a local copy.
// We don't await the write: the offline cache makes it safe, and the next post
// shouldn't wait for the network.
function persist(patch) {
  updateDoc(participantRef(uid), patch).catch((e) => console.error("save failed", e));
  mirror();
}

// A simple message card. Resolves when its button is clicked (if it has one).
function notice({ title, body, button }) {
  setCounter(0, 0);
  bar.innerHTML = "";                                     // no answer buttons on notices
  main.className = "feed";
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

// Decorative "stories" row built from the fictional accounts.
function renderStories() {
  document.getElementById("stories").innerHTML = POSTERS.map((p) => `
    <div class="story"><div class="story-ring">${avatarHTML(p)}</div>
    <span>${p.name.split(" ")[0]}</span></div>`).join("");
}

// ---------------------------------------------------------------------------
// Joining: one transaction assigns the less-full list (A/B) and creates the
// participant document, so two phones joining at once can't unbalance lists.
// ---------------------------------------------------------------------------
async function join() {
  await runTransaction(db, async (tx) => {
    const pSnap = await tx.get(participantRef(uid));      // already joined? keep it
    if (pSnap.exists()) { state = pSnap.data(); return; }
    const sSnap = await tx.get(sessionRef);
    const s = sSnap.data();
    const countA = s.countA || 0, countB = s.countB || 0;
    const list = countA < countB ? "A" : countB < countA ? "B"
      : (crypto.getRandomValues(new Uint8Array(1))[0] % 2 ? "A" : "B"); // tie: coin flip
    const late = s.phase !== "p1";                        // missed Phase 1 -> excluded later
    const seenSet = list === "A" ? "X" : "Y";             // list A sees set X in Phase 1
    const ids = STATEMENTS.map((x) => x.id);
    state = {
      list, late,
      order1: shuffle(ids.filter((id) => byId[id].set === seenSet)), // 16 Phase-1 posts
      order2: shuffle(ids),                                          // all 32 for Phase 2
      p1: {}, p2: {},                                                // answers: id -> {a, rt, at}
      stage: late ? "wait" : "p1",                                   // where to resume
      joinedAt: serverTimestamp(),
      ua: navigator.userAgent.slice(0, 80),                          // device hint, for debugging
    };
    tx.update(sessionRef, list === "A" ? { countA: countA + 1 } : { countB: countB + 1 });
    tx.set(participantRef(uid), state);
  });
  mirror();
}

// ---------------------------------------------------------------------------
// One phase: show every post in `order` that isn't answered yet.
// ---------------------------------------------------------------------------
async function runPhase(phase, order, minMs) {
  main.className = `feed mode-${phase}`;                  // CSS colours per phase
  for (let i = 0; i < order.length; i++) {
    const id = order[i];
    if (state[phase][id]) continue;                       // answered before a reload
    setCounter(i + 1, order.length);
    const { answer, rt } = await showPost({
      root: main, bar, statement: byId[id],
      poster: posterBy[byId[id].poster],                  // fixed account per statement
      mode: phase, minMs,
    });
    state[phase][id] = { a: answer, rt };                 // local copy
    persist({ [`${phase}.${id}`]: { a: answer, rt, at: serverTimestamp() } }); // "p1.s07": {...}
  }
}

function setStage(stage) { state.stage = stage; persist({ stage }); }

// ---------------------------------------------------------------------------
// Personal summary, shown only on this phone. Shows the repetition split,
// with the honest caveat that one person's numbers are mostly chance.
// ---------------------------------------------------------------------------
function wrapped() {
  if (state.late) return `<p>You joined after part 1, so your answers aren't part of the comparison, but thanks for taking part!</p>`;
  const seen = new Set(state.order1);
  let seenTrue = 0, newTrue = 0;
  for (const [id, { a }] of Object.entries(state.p2)) {
    if (a !== "true") continue;
    if (seen.has(id)) seenTrue++; else newTrue++;
  }
  const nSeen = state.order1.length, nNew = state.order2.length - nSeen;
  return `
    <p>Some posts in part 2 were ones you'd already scrolled past in part 1. Here's how you judged them:</p>
    <div class="wrapped">
      <div class="wrap-row"><span class="wrap-label">Posts you'd seen before</span>
        <span class="wrap-num">${seenTrue}<small> / ${nSeen}</small></span><span class="wrap-sub">marked true</span></div>
      <div class="wrap-row"><span class="wrap-label">New posts</span>
        <span class="wrap-num">${newTrue}<small> / ${nNew}</small></span><span class="wrap-sub">marked true</span></div>
    </div>
    <p class="muted small">Both groups had the same mix of true and false posts. With 16 posts each,
    one person's gap is mostly chance; the class result is what counts.</p>`;
}

// ---------------------------------------------------------------------------
// The flow, as a small state machine driven by state.stage.
// ---------------------------------------------------------------------------
async function run() {
  if (!state) {
    // Not joined yet: wait until the presenters open the experiment.
    if (!session || !["p1", "wait", "p2"].includes(session.phase)) {
      notice({ title: "Echo isn't open yet", body: `<p>Hang on, the presenters will open it in a moment. This page updates by itself.</p>` });
      await waitForPhase((p) => ["p1", "wait", "p2"].includes(p));
    }
    if (session.phase === "p1") {
      await notice({
        title: "Welcome to Echo 👋",
        body: `<p>You're one of our first users! Scroll through your feed of ${STATEMENTS.length / 2} posts.</p>
               <p>Tap <b>♥ Like</b> on posts you find interesting, or <b>Scroll past</b> the ones you don't.
               You can also swipe the post, or double-tap it to like.</p>
               <p class="muted small">Go at your own pace.</p>`,
        button: "Start scrolling",
      });
    }
    notice({ title: "Connecting…", body: `<p class="muted">Setting up your feed.</p>` });
    await join();
  }

  if (state.stage === "p1") {
    await runPhase("p1", state.order1, MIN_VIEW_MS_P1);
    setStage("wait");
  }

  if (state.stage === "wait") {
    notice({
      title: state.late ? "Welcome to Echo 👋" : "You're all caught up ✓",
      body: state.late
        ? `<p>Part 2 is about to start. This page will continue by itself.</p>`
        : `<p>Thanks! Keep this page open, or scan the same QR code again later.
           We'll continue at the end of the class. This page will move on by itself.</p>
           <p class="muted small">Please use the same phone and browser, not a private tab.</p>`,
    });
    await waitForPhase((p) => p === "p2");
    setStage("p2intro");
  }

  if (state.stage === "p2intro") {
    await notice({
      title: "Part 2",
      body: `<p>Now you'll see ${state.order2.length} posts. Some are true and some are false.</p>
             <p>Is the main claim in this post true? For each post, choose <b class="t-true">✓ True</b> or <b class="t-false">✕ Not true</b>.</p>`,
      button: "Start",
    });
    setStage("p2");
  }

  if (state.stage === "p2") {
    await runPhase("p2", state.order2, MIN_VIEW_MS_P2);
    setStage("done");
  }

  if (state.stage === "done") {
    notice({ title: "Done, thank you! 🎉", body: `${wrapped()}<p><b>Look up at the screen for the class results.</b></p>` });
  }
}

// ---------------------------------------------------------------------------
// Start-up: sign in, follow the session, load this participant (if any), run.
// ---------------------------------------------------------------------------
async function start() {
  renderStories();
  notice({ title: "Loading Echo…", body: `<p class="muted">One moment.</p>` });
  try {
    // Reuse the saved anonymous login, or create one on first visit.
    const user = (await currentUser()) || (await signInAnonymously(auth)).user;
    uid = user.uid;

    // Follow the session doc live; resolve once we have the first value.
    await new Promise((resolve) => {
      onSnapshot(sessionRef, (snap) => {
        session = snap.exists() ? snap.data() : null;
        onSessionChange();
        resolve();
      }, (err) => { console.error(err); resolve(); });
    });

    // Already joined earlier (reload / scanned again)? Resume from the saved doc.
    const pSnap = await getDoc(participantRef(uid));
    if (pSnap.exists()) state = pSnap.data();

    await run();
  } catch (e) {
    console.error(e);
    notice({
      title: "Couldn't connect",
      body: `<p>Check your internet connection (mobile data works too), then reload.</p>
             <p class="muted small">${String(e.code || e.message || e).slice(0, 120)}</p>`,
      button: "Reload",
    }).then(() => location.reload());
  }
}

start();
