// js/feed.js
// ---------------------------------------------------------------------------
// Shows ONE post card and waits for ONE answer.
// The same function serves Phase 1 (Interesting / Not interesting) and
// Phase 2 (True / Not true). Buttons, swipe and arrow keys all funnel into a
// single answer() function, so there is exactly one place where an answer
// is recorded — that is what makes double answers impossible.
// ---------------------------------------------------------------------------

// Labels and button styles per phase. "right" = swipe right / ArrowRight.
const MODES = {
  p1: {
    left:  { value: "skip", label: "Not interesting", icon: "",  cls: "btn-neutral" },
    right: { value: "like", label: "Interesting",     icon: "♥", cls: "btn-like" },
  },
  p2: {
    left:  { value: "not",  label: "Not true", icon: "✕", cls: "btn-false" },
    right: { value: "true", label: "True",     icon: "✓", cls: "btn-true" },
  },
};

// Escape text before putting it into HTML, so a statement can never inject markup.
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Initials for the round avatar: "Maya Levi" -> "ML".
const initials = (name) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

/**
 * Render one post into `root` and resolve with { answer, rt } when answered.
 * @param root      element that holds the card + buttons
 * @param statement { id, text }
 * @param poster    { name, handle, color }
 * @param mode      "p1" | "p2"
 * @param minMs     minimum on-screen time before answers are accepted
 */
export function showPost({ root, statement, poster, mode, minMs }) {
  const m = MODES[mode]; // the labels for this phase

  return new Promise((resolve) => {
    // --- 1. Build the markup -------------------------------------------------
    root.innerHTML = `
      <article class="post" id="card">
        <div class="stamp stamp-left">${esc(m.left.label)}</div>
        <div class="stamp stamp-right">${esc(m.right.label)}</div>
        <header class="post-head">
          <div class="avatar" style="background:${poster.color}">${esc(initials(poster.name))}</div>
          <div class="who">
            <span class="name">${esc(poster.name)}</span>
            <span class="meta">@${esc(poster.handle)} · ${1 + Math.floor(Math.random() * 11)}h</span>
          </div>
          <span class="dots" aria-hidden="true">•••</span>
        </header>
        <p class="post-text">${esc(statement.text)}</p>
        <div class="timer" aria-hidden="true"><div class="timer-fill" style="animation-duration:${minMs}ms"></div></div>
      </article>
      <div class="actions">
        <button class="btn ${m.left.cls}"  data-side="left"  disabled>${m.left.icon ? `<span aria-hidden="true">${m.left.icon}</span> ` : ""}${esc(m.left.label)}</button>
        <button class="btn ${m.right.cls}" data-side="right" disabled>${m.right.icon ? `<span aria-hidden="true">${m.right.icon}</span> ` : ""}${esc(m.right.label)}</button>
      </div>
      <p class="hint">Swipe the post ← → or tap a button</p>`;

    const card = root.querySelector("#card");          // the draggable post
    const buttons = root.querySelectorAll(".btn");     // the two answer buttons
    const shownAt = performance.now();                 // start of the response-time clock
    let ready = false;                                 // becomes true after minMs
    let locked = false;                                // becomes true after the first answer

    // --- 2. Unlock answering after the minimum view time ---------------------
    const unlockTimer = setTimeout(() => {
      ready = true;                                    // answers now accepted
      buttons.forEach((b) => (b.disabled = false));    // enable buttons
      card.classList.add("ready");                     // hides the timer bar
    }, minMs);

    // --- 3. The single place an answer is recorded ---------------------------
    function answer(side) {
      if (!ready || locked) return;                    // too early, or already answered
      locked = true;                                   // block any second answer
      const rt = Math.round(performance.now() - shownAt); // response time in ms
      cleanup();                                       // remove listeners
      buttons.forEach((b) => (b.disabled = true));     // grey out buttons
      card.classList.add(side === "right" ? "fly-right" : "fly-left"); // exit animation
      // Wait for the animation to finish, then hand the answer back to the app.
      setTimeout(() => resolve({ answer: m[side].value, rt }), 260);
    }

    // Buttons: read which side the button represents.
    buttons.forEach((b) => b.addEventListener("click", () => answer(b.dataset.side)));

    // Keyboard on laptops: ← = left answer, → = right answer.
    function onKey(e) {
      if (e.key === "ArrowLeft") answer("left");
      if (e.key === "ArrowRight") answer("right");
    }
    window.addEventListener("keydown", onKey);

    // --- 4. Swipe with Pointer Events (one API for touch, mouse and pen) -----
    let startX = null;                                 // where the drag began
    let dx = 0;                                        // current horizontal offset

    card.addEventListener("pointerdown", (e) => {
      if (locked) return;
      startX = e.clientX;                              // remember the start point
      card.setPointerCapture(e.pointerId);             // keep getting events even off the card
      card.classList.add("dragging");                  // disables the snap-back transition
    });

    card.addEventListener("pointermove", (e) => {
      if (startX === null) return;                     // not dragging
      dx = e.clientX - startX;                         // how far we moved
      card.style.transform = `translateX(${dx}px) rotate(${dx / 25}deg)`; // follow the finger
      // Show the label of the side we're heading to (only once answering is allowed).
      card.dataset.lean = ready ? (dx > 40 ? "right" : dx < -40 ? "left" : "") : "";
    });

    function endDrag() {
      if (startX === null) return;
      const threshold = Math.min(100, card.offsetWidth * 0.3); // ~30% of the width
      card.classList.remove("dragging");
      startX = null;
      card.dataset.lean = "";
      if (ready && Math.abs(dx) > threshold) {
        answer(dx > 0 ? "right" : "left");             // far enough: counts as an answer
      } else {
        card.style.transform = "";                     // not far enough or too early: snap back
      }
      dx = 0;
    }
    card.addEventListener("pointerup", endDrag);
    card.addEventListener("pointercancel", endDrag);

    // Remove the global keyboard listener so old cards can't answer later.
    function cleanup() {
      clearTimeout(unlockTimer);
      window.removeEventListener("keydown", onKey);
    }
  });
}
