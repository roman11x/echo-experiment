// js/firebase.js
// ---------------------------------------------------------------------------
// Firebase setup, shared by all three pages (participant, admin, results).
// Loaded straight from Google's CDN as ES modules: no npm, no build step.
// The version in each URL is pinned (13.4.0); keep all three identical.
// ---------------------------------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged,
  GoogleAuthProvider, signInWithPopup, signOut,
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  onSnapshot, runTransaction, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import { FIREBASE_CONFIG, SESSION_ID } from "./config.js";

export const app = initializeApp(FIREBASE_CONFIG);   // connect to our project
export const auth = getAuth(app);                    // sign-in (anonymous / Google)

// Firestore with an offline cache: answers are saved locally first and synced
// when the connection is back, so a flaky classroom network never blocks a tap.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

// Handy references for this session.
export const sessionRef = doc(db, "sessions", SESSION_ID);                  // phase, reveal, counts
export const participantsCol = collection(db, "sessions", SESSION_ID, "participants");
export const participantRef = (uid) => doc(db, "sessions", SESSION_ID, "participants", uid);

// Resolves with the current user once Firebase has restored the saved login
// (or with null if nobody is signed in on this browser).
export function currentUser() {
  return new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (u) => { stop(); resolve(u); });
  });
}

// Re-export what the pages use, so they only import from this one file.
export {
  signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, runTransaction, serverTimestamp,
};
