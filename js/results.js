// js/results.js — the projected class results
// ---------------------------------------------------------------------------
// Listens live to all participant documents and recomputes the numbers on
// every change. Shows only the response count until "revealed" is true.
// Only presenter accounts can read participants (see firestore.rules).
// ---------------------------------------------------------------------------

import { SESSION_ID } from "./config.js";
import { sessionRef, participantsCol, onSnapshot, updateDoc } from "./firebase.js";
import { requireAdmin } from "./admin-auth.js";
import { summarize } from "./stats.js";

const $ = (id) => document.getElementById(id);
let session = null, participants = [];

$("sessionTag").textContent = `session: ${SESSION_ID}`;

requireAdmin($("auth"), () => {
  $("auth").hidden = true;                                 // keep the projector view clean
  $("panel").hidden = false;
  onSnapshot(sessionRef, (s) => { session = s.data() || {}; draw(); });
  onSnapshot(participantsCol, (s) => { participants = s.docs.map((d) => ({ id: d.id, ...d.data() })); draw(); });
});

$("reveal").onclick = () => updateDoc(sessionRef, { revealed: true });
$("hide").onclick = () => updateDoc(sessionRef, { revealed: false });

// Grouped vertical bars: each group = { label, repeated: {pct,n}, new: {pct,n} }.
// Values are printed on the bars, so colour never carries the meaning alone.
function bars(el, groups, { reference } = {}) {
  el.innerHTML = groups.map((g) => `
    <div class="group${g.key === "known-false" ? " key-group" : ""}">
      <div class="bars">
        ${[["rep", "Seen in part 1", g.repeated], ["new", "New", g.new]].map(([cls, name, v]) => `
          <div class="bar-col" data-tip="${name}: ${v.pct ?? "–"}% said true (${v.nLabel || `${v.n} judgments`})">
            <div class="bar bar-${cls}" style="height:${v.pct ?? 0}%"><span class="bar-val">${v.pct ?? "–"}%</span></div>
          </div>`).join("")}
      </div>
      <div class="group-label">${g.label}</div>
    </div>`).join("") + (reference ? `<div class="ref-note">${reference}</div>` : "");
}

function draw() {
  if (!session) return;
  const s = summarize(participants);
  const revealed = !!session.revealed;
  $("waiting").hidden = revealed;
  $("results").hidden = !revealed;

  $("count").textContent = `${s.nDone}`;
  $("countSub").textContent = `finished · ${s.nJoined} joined`;
  if (!revealed) return;

  bars($("mainChart"), [{ label: "Our class", repeated: s.repeated, new: s.new },
                        { label: "Fazio et al. (2015), Exp. 2", repeated: { pct: 62, nLabel: "published, 40 participants" }, new: { pct: 56, nLabel: "published, 40 participants" } }]);
  $("nNote").textContent = `${s.nIncluded} people included (did both parts)` +
    (s.nExcluded ? ` · ${s.nExcluded} left out (joined late or didn't finish)` : "");
  bars($("cellChart"), s.byCell.map((g) => ({ label: g.label, repeated: g.repeated, new: g.new, key: g.key })));
}

// Hover tooltip for any bar (laptop mouse).
const tip = $("tip");
document.addEventListener("mousemove", (e) => {
  const t = e.target.closest("[data-tip]");
  if (!t) { tip.hidden = true; return; }
  tip.hidden = false;
  tip.textContent = t.dataset.tip;
  tip.style.left = `${e.clientX + 14}px`;
  tip.style.top = `${e.clientY + 14}px`;
});
