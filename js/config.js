// js/config.js
// ---------------------------------------------------------------------------
// All tunable settings in one place.
// ---------------------------------------------------------------------------

// Firebase web config. This is PUBLIC by design: it only tells the SDK which
// project to talk to. What protects the data is Auth + the Security Rules
// in firestore.rules (pasted into the Firebase console).
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCJGsyfa5lG_XiUYMJxs9EZPnIXQvO449M",
  authDomain: "ilusion-8ce57.firebaseapp.com",
  projectId: "ilusion-8ce57",
  storageBucket: "ilusion-8ce57.firebasestorage.app",
  messagingSenderId: "300305693597",
  appId: "1:300305693597:web:a4cac19c8c1376d0080d74",
};

// Google accounts allowed to control the experiment. Must match firestore.rules.
export const ADMIN_EMAILS = ["romanmax1000@gmail.com", "adibelso3357@gmail.com"];

// Which session the page uses. Real run = "live" (the default).
// Rehearsals: add ?session=test to every URL so test data never mixes with real data.
export const SESSION_ID = new URLSearchParams(location.search).get("session") || "live";

// Minimum time (ms) a post stays up before an answer counts. Not shown as a
// timer: it only stops accidental double taps / blind tapping. Everyone
// otherwise goes at their own pace; response times are recorded anyway.
export const MIN_VIEW_MS_P1 = 1000;
export const MIN_VIEW_MS_P2 = 1000;

// Local backup copy of progress (also used if the network drops).
// Includes the session id so test and live progress never collide.
export const STORAGE_KEY = `echo-exp-v2-${SESSION_ID}`;
