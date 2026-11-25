// js/feed.js
// ---------------------------------------------------------------------------
// Shows ONE post and waits for ONE answer.
// Phase 1: "♥ Like" / "Scroll past"   Phase 2: "✓ True" / "✕ Not true"
// Buttons, swipe and arrow keys all go through a single answer() function,
// so a post can never be answered twice.
// ---------------------------------------------------------------------------

// Small inline icons (decorative, so screen readers skip them).
const ICON = {
  reply:  `<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  repost: `<svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  heart:  `<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  share:  `<svg viewBox="0 0 24 24"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 13v6h14v-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

// Labels per phase. "right" = swipe right / ArrowRight.
const MODES = {
  p1: {
    left:  { value: "skip", label: "Scroll past", icon: "↓", cls: "btn-neutral" },
    right: { value: "like", label: "Like",        icon: "♥", cls: "btn-like" },
  },
  p2: {
    left:  { value: "not",  label: "Not true", icon: "✕", cls: "btn-false" },
    right: { value: "true", label: "True",     icon: "✓", cls: "btn-true" },
  },
};

// Escape text before putting it into HTML, so a statement can never inject markup.
export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Post age ("3h") derived from the id, so a repeated post shows the same age
// in both phases instead of a new random one: "s07" -> 1..11.
const postAge = (id) => 1 + (parseInt(id.slice(1), 10) * 7) % 11;

// Initials for the round avatar: "Maya Levi" -> "ML".
export const initials = (name) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

// Round avatar: the picture sits on top of the initials; if the picture
// can't load, onerror removes it and the initials underneath show instead.
export const avatarHTML = (p, cls = "avatar") => `
  <div class="${cls}" style="background:${p.color}">${esc(initials(p.name))}${
    p.img ? `<img src="${p.img}" alt="" onerror="this.remove()">` : ""}</div>`;

/**
 * Render one post into `root`, its buttons into `bar`, and resolve with
 * { answer, rt } once answered.
 * @param root      element that holds the post (inside the scrolling feed)
 * @param bar       element above the bottom nav that holds the two buttons
 * @param statement { id, text }
 * @param poster    { name, handle, color }
 * @param mode      "p1" | "p2"
 * @param minMs     minimum time before an answer counts (no visible timer)
 */
export function showPost({ root, bar, statement, poster, mode, minMs }) {
  const m = MODES[mode];

  return new Promise((resolve) => {
    // --- 1. Markup: the post, then a faded "next post" peeking underneath ----
    root.innerHTML = `
      <article class="post" id="card">
        <div class="stamp stamp-left">${esc(m.left.label)}</div>
        <div class="stamp stamp-right">${esc(m.right.label)}</div>
        <div class="heart-pop" aria-hidden="true">♥</div>
        <header class="post-head">
          ${avatarHTML(poster)}
          <div class="who">
            <span class="name">${esc(poster.name)}</span>
            <span class="meta">@${esc(poster.handle)} · ${postAge(statement.id)}h</span>
          </div>
          <span class="dots" aria-hidden="true">•••</span>
        </header>
        <p class="post-text">${esc(statement.text)}</p>
        <div class="post-actions" aria-hidden="true">
          <span>${ICON.reply}</span><span>${ICON.repost}</span><span class="act-heart">${ICON.heart}</span><span>${ICON.share}</span>
        </div>
      </article>
      ${`<div class="post ghost" aria-hidden="true">
        <div class="post-head"><div class="avatar sk"></div><div class="who"><span class="sk-line w40"></span><span class="sk-line w25"></span></div></div>
        <span class="sk-line w90"></span><span class="sk-line w70"></span>
      </div>`.repeat(2)}`;

    bar.innerHTML = `
      <button class="btn ${m.left.cls}"  data-side="left"  disabled><span aria-hidden="true">${m.left.icon}</span> ${esc(m.left.label)}</button>
      <button class="btn ${m.right.cls}" data-side="right" disabled><span aria-hidden="true">${m.right.icon}</span> ${esc(m.right.label)}</button>`;

    const card = root.querySelector("#card");          // the draggable post
    const buttons = bar.querySelectorAll(".btn");      // the two answer buttons
    const shownAt = performance.now();                 // start of the response-time clock
    let ready = false;                                 // true after minMs
    let locked = false;                                // true after the first answer

    // --- 2. Short invisible lock (no timer bar) ------------------------------
    const unlockTimer = setTimeout(() => {
      ready = true;
      buttons.forEach((b) => (b.disabled = false));
    }, minMs);

    // --- 3. The single place an answer is recorded ---------------------------
    // `via` = "swipe" | "tap": decides which exit animation plays.
    function answer(side, via) {
      if (!ready || locked) return;                    // too early, or already answered
      locked = true;                                   // block any second answer
      const rt = Math.round(performance.now() - shownAt); // response time in ms
      cleanup();
      buttons.forEach((b) => (b.disabled = true));
      bar.querySelector(`[data-side=${side}]`).classList.add("chosen"); // highlight the choice

      let delay = 320;                                 // how long the exit animation runs
      if (via === "swipe" || mode === "p2") {
        card.dataset.lean = side;                      // show the label stamp
        card.classList.add(side === "right" ? "fly-right" : "fly-left");
      } else if (m[side].value === "like") {
        card.classList.add("liked");                   // big heart pops on the post…
        setTimeout(() => card.classList.add("scroll-up"), 380); // …then the feed scrolls on
        delay = 700;
      } else {
        card.classList.add("scroll-up");               // "scroll past": the post slides away
      }
      setTimeout(() => resolve({ answer: m[side].value, rt }), delay);
    }

    buttons.forEach((b) => b.addEventListener("click", () => answer(b.dataset.side, "tap")));

    // Keyboard on laptops: ← = left answer, → = right answer.
    function onKey(e) {
      if (e.key === "ArrowLeft") answer("left", "tap");
      if (e.key === "ArrowRight") answer("right", "tap");
    }
    window.addEventListener("keydown", onKey);

    // Double-tap the post to like it, like on Instagram (Phase 1 only).
    if (mode === "p1") card.addEventListener("dblclick", () => answer("right", "tap"));

    // --- 4. Swipe with Pointer Events (one API for touch, mouse and pen) -----
    let startX = null;                                 // where the drag began
    let dx = 0;                                        // current horizontal offset

    card.addEventListener("pointerdown", (e) => {
      if (locked) return;
      startX = e.clientX;
      card.setPointerCapture(e.pointerId);             // keep receiving moves off the card
      card.classList.add("dragging");                  // no transition while following the finger
    });

    card.addEventListener("pointermove", (e) => {
      if (startX === null) return;
      dx = e.clientX - startX;
      card.style.transform = `translateX(${dx}px) rotate(${dx / 25}deg)`;
      card.dataset.lean = ready ? (dx > 40 ? "right" : dx < -40 ? "left" : "") : "";
    });

    function endDrag() {
      if (startX === null) return;
      const threshold = Math.min(100, card.offsetWidth * 0.3); // ~30% of the width
      card.classList.remove("dragging");
      startX = null;
      if (ready && Math.abs(dx) > threshold) {
        answer(dx > 0 ? "right" : "left", "swipe");    // far enough: counts
      } else {
        card.style.transform = "";                     // otherwise snap back
        card.dataset.lean = "";
      }
      dx = 0;
    }
    card.addEventListener("pointerup", endDrag);
    card.addEventListener("pointercancel", endDrag);

    function cleanup() {
      clearTimeout(unlockTimer);
      window.removeEventListener("keydown", onKey);
    }
  });
}
