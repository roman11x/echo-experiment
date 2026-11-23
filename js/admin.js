// js/admin.js — presenter controls (works on a phone or a laptop)
// ---------------------------------------------------------------------------
// Writes the session document (phase + reveal). Every participant's page is
// listening to that document, so a button here moves all phones at once.
// ---------------------------------------------------------------------------

import { SESSION_ID } from "./config.js";
import { sessionRef, participantsCol, onSnapshot, setDoc, updateDoc, getDocs, deleteDoc, getDoc } from "./firebase.js";
import { requireAdmin } from "./admin-auth.js";
import { rows, toCSV } from "./stats.js";

const $ = (id) => document.getElementById(id);
const PHASE_NAMES = { p1: "part 1 open", wait: "talk (part 1 closed)", p2: "part 2 open", closed: "closed" };
let session = null;          // latest session doc
let participants = [];       // latest participant docs (with .id)

$("sessionTag").textContent = `session: ${SESSION_ID}`;
const plink = new URL("./", location.href);                       // participant page URL
if (SESSION_ID !== "live") plink.searchParams.set("session", SESSION_ID);
$("plink").href = $("plink").textContent = plink.href;

requireAdmin($("auth"), async () => {
  $("panel").hidden = false;

  // First run: create the session document if it doesn't exist yet.
  if (!(await getDoc(sessionRef)).exists()) {
    await setDoc(sessionRef, { phase: "closed", revealed: false, countA: 0, countB: 0 });
  }

  // Live view of the session.
  onSnapshot(sessionRef, (snap) => {
    session = snap.data();
    $("phase").textContent = PHASE_NAMES[session.phase] || session.phase;
    $("revealed").textContent = session.revealed ? "shown" : "hidden";
    $("reveal").textContent = session.revealed ? "Hide results" : "Reveal results";
    document.querySelectorAll("[data-phase]").forEach((b) => b.classList.toggle("current", b.dataset.phase === session.phase));
    drawStats();
  });

  // Live view of the participants.
  onSnapshot(participantsCol, (snap) => {
    participants = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    drawStats();
  });
});

// Phase buttons.
document.querySelectorAll("[data-phase]").forEach((b) =>
  b.addEventListener("click", () => updateDoc(sessionRef, { phase: b.dataset.phase }).catch(fail)));

// Reveal / hide toggle.
$("reveal").onclick = () => updateDoc(sessionRef, { revealed: !session?.revealed }).catch(fail);

// Downloads.
const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click();
}
$("csv").onclick = () => download(`echo-${SESSION_ID}-${stamp()}.csv`, toCSV(rows(participants)), "text/csv");
$("json").onclick = () => download(`echo-${SESSION_ID}-${stamp()}.json`, JSON.stringify(participants, null, 2), "application/json");

// Reset: type the session name to confirm, so it can't happen by accident.
$("reset").onclick = async () => {
  const typed = prompt(`This deletes every answer in session "${SESSION_ID}". Download the data first if you need it.\nType ${SESSION_ID} to confirm:`);
  if (typed !== SESSION_ID) return;
  const snap = await getDocs(participantsCol);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  await setDoc(sessionRef, { phase: "closed", revealed: false, countA: 0, countB: 0 });
};

function fail(e) { alert(`That didn't work: ${e.code || e.message}`); }

// Counters + a small table of who is where.
function drawStats() {
  const by = (f) => participants.filter(f).length;
  const cells = [
    ["joined", participants.length],
    ["list A / B", `${by((p) => p.list === "A")} / ${by((p) => p.list === "B")}`],
    ["in part 1", by((p) => p.stage === "p1")],
    ["waiting", by((p) => p.stage === "wait")],
    ["in part 2", by((p) => p.stage === "p2intro" || p.stage === "p2")],
    ["done", by((p) => p.stage === "done")],
    ["late", by((p) => p.late)],
  ];
  $("stats").innerHTML = cells.map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`).join("");
  $("ptable").innerHTML = participants
    .sort((a, b) => (a.joinedAt?.seconds || 0) - (b.joinedAt?.seconds || 0))
    .map((p) => `<tr><td>${p.id.slice(0, 5)}</td><td>${p.list}</td><td>${p.stage}</td>
      <td>${Object.keys(p.p1 || {}).length}/${p.order1?.length || 0}</td>
      <td>${Object.keys(p.p2 || {}).length}/${p.order2?.length || 0}</td>
      <td>${p.late ? '<span class="chip">late</span>' : ""}</td></tr>`).join("");
}
