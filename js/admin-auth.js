// js/admin-auth.js
// ---------------------------------------------------------------------------
// Google sign-in for the presenter pages (admin + results).
// The email check here only decides what the page SHOWS; the real protection
// is in firestore.rules, which refuse writes/reads from anyone else.
// ---------------------------------------------------------------------------

import { ADMIN_EMAILS } from "./config.js";
import { auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";

// Calls onReady(user) once an allowed admin is signed in; draws a sign-in
// button into `box` otherwise.
export function requireAdmin(box, onReady) {
  onAuthStateChanged(auth, (user) => {
    const ok = user && !user.isAnonymous && ADMIN_EMAILS.includes(user.email);
    if (ok) { box.innerHTML = `<span class="muted small">Signed in as ${user.email}</span> <button class="link" id="out">Sign out</button>`;
      box.querySelector("#out").onclick = () => signOut(auth);
      onReady(user);
      return;
    }
    box.innerHTML = `
      ${user && !user.isAnonymous ? `<p class="small">${user.email} isn't a presenter account.</p>` : ""}
      <button class="btn btn-like" id="in">Sign in with Google</button>`;
    box.querySelector("#in").onclick = () =>
      signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => alert(`Sign-in failed: ${e.code || e.message}`));
  });
}
