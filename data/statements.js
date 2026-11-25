// data/statements.js
// ---------------------------------------------------------------------------
// The ONLY file you edit to swap in the real statements.
//
// Each statement has fixed metadata (never changes per participant):
//   id    – stable short id, used as the key when answers are saved
//   text  – what the participant reads
//   truth – true if the statement is actually true
//   known – "known" or "unknown": OUR estimate of whether students know it
//           (Fazio Exp. 2 did the same with 1980 norms; no knowledge check)
//   poster – handle of the account that posts it (fixed in both phases)
//   set   – "X" or "Y": the two halves used for counterbalancing.
//           List A shows set X in Phase 1 (so X = repeated, Y = new);
//           List B shows set Y in Phase 1 (so Y = repeated, X = new).
//
// Balance rule: each set holds the same mix,
// i.e. 4 × (true, known), 4 × (true, unknown), 4 × (false, known),
// 4 × (false, unknown) — 16 per set, 32 total.
// ---------------------------------------------------------------------------

// Checked against sources (Britannica, NASA, NOAA, Kew, NPS, olympics.com…).
// None come from the Fazio paper or the deck. Spares are at the bottom.
export const STATEMENTS = [
  // ---- Set X (16) ----
  // true · known
  { id: "s01", text: "Mount Everest is the highest mountain in the world above sea level.", truth: true, known: "known", set: "X", poster: "dailytrivia" },
  { id: "s02", text: "Took my niece to the natural history museum today. Told her the blue whale is the largest animal alive in the world today 🐋", truth: true, known: "known", set: "X", poster: "mayal" },
  { id: "s03", text: "A diamond is a very hard crystal made of carbon.", truth: true, known: "known", set: "X", poster: "factcorner" },   // replaced Canberra: both pilots rejected it (people think Sydney)
  { id: "s04", text: "Finally got to see Leonardo da Vinci's Mona Lisa in person. Way smaller than I expected.", truth: true, known: "known", set: "X", poster: "noamk" },
  // true · unknown
  { id: "s05", text: "Thimphu is the capital city of the small Asian country Bhutan.", truth: true, known: "unknown", set: "X", poster: "didyouknow" },
  { id: "s06", text: "Got an okapi on my calendar this month. These animals from central Africa are close relatives of giraffes.", truth: true, known: "unknown", set: "X", poster: "shirab" },
  { id: "s07", text: "Helium is the second most common element in the universe.", truth: true, known: "unknown", set: "X", poster: "quickfacts" },
  { id: "s08", text: "Started a food history book on the train. Chapter one: the potato was first grown as a food crop in South America.", truth: true, known: "unknown", set: "X", poster: "talc" },
  // false · known            (real answer in the comment)
  { id: "s09", text: "The ancient Colosseum arena stands in the center of Naples.", truth: false, known: "known", set: "X", poster: "dailytrivia" },        // Rome
  { id: "s10", text: "My little brother's school project is on the giant panda, a wild animal native to Japan. Our living room is now full of bamboo drawings 🐼", truth: false, known: "known", set: "X", poster: "mayal" },                 // China
  { id: "s11", text: "Venus is the planet that is closest to the Sun.", truth: false, known: "known", set: "X", poster: "factcorner" },                  // Mercury
  { id: "s12", text: "Physics exam tomorrow and I'm stuck on the theory of relativity, which Isaac Newton developed. Wish me luck.", truth: false, known: "known", set: "X", poster: "noamk" }, // Einstein
  // false · unknown
  { id: "s13", text: "Planning a cycling trip along the Danube this summer 🚲 The river flows into the North Sea.", truth: false, known: "unknown", set: "X", poster: "shirab" },            // Black Sea
  { id: "s14", text: "The emu is a large running bird native to South Africa.", truth: false, known: "unknown", set: "X", poster: "didyouknow" },         // Australia
  { id: "s15", text: "Sound travels faster through air than through water.", truth: false, known: "unknown", set: "X", poster: "quickfacts" },             // ~4x faster in water (replaced silver/Si: IS students know Si = silicon)
  { id: "s16", text: "Watching a football documentary tonight ⚽ The first World Cup was held in Argentina in 1930.", truth: false, known: "unknown", set: "X", poster: "talc" },     // Uruguay

  // ---- Set Y (16) ----
  // true · known
  { id: "s17", text: "Cairo, on the Nile River, is the capital city of Egypt.", truth: true, known: "known", set: "Y", poster: "didyouknow" },
  { id: "s18", text: "Watched a nature documentary last night. The cheetah is the fastest land animal in the world.", truth: true, known: "known", set: "Y", poster: "shirab" },
  { id: "s19", text: "Most species of penguin live in the Southern Hemisphere.", truth: true, known: "known", set: "Y", poster: "quickfacts" },
  { id: "s20", text: "Going to see Romeo and Juliet tonight 🎭 The play was written by William Shakespeare, and this is my first time seeing it on stage.", truth: true, known: "known", set: "Y", poster: "talc" },
  // true · unknown
  { id: "s21", text: "Saving up for a stargazing trip to the Atacama Desert, which is located in the north of Chile 🌵✨", truth: true, known: "unknown", set: "Y", poster: "mayal" },
  { id: "s22", text: "Met a capybara at a petting zoo today 🥹 It's the largest rodent living in the world today, and it was the calmest animal there.", truth: true, known: "unknown", set: "Y", poster: "noamk" },   // may be known: check in pre-test
  { id: "s23", text: "Bronze is a metal made mostly by mixing copper and tin.", truth: true, known: "unknown", set: "Y", poster: "dailytrivia" },
  { id: "s24", text: "The first modern Olympic Games were held in Athens in 1896.", truth: true, known: "unknown", set: "Y", poster: "factcorner" },    // may be known: check in pre-test
  // false · known
  { id: "s25", text: "The Statue of Liberty in New York was a gift from England.", truth: false, known: "known", set: "Y", poster: "didyouknow" },        // France
  { id: "s26", text: "A whole weekend in Lisbon ✈️ I've wanted to visit the capital of Spain for ages.", truth: false, known: "known", set: "Y", poster: "shirab" },                              // Madrid (replaced "bats are birds": too absurd)
  { id: "s27", text: "Watching old Moon landing footage with Dad 🌕 Buzz Aldrin was the first person to walk on the Moon.", truth: false, known: "known", set: "Y", poster: "talc" },             // Neil Armstrong
  { id: "s28", text: "The famous painting The Starry Night was made by Claude Monet.", truth: false, known: "known", set: "Y", poster: "quickfacts" },    // Van Gogh
  // false · unknown
  { id: "s29", text: "Yangon is the capital city of the Asian country Laos.", truth: false, known: "unknown", set: "Y", poster: "dailytrivia" },           // Vientiane
  { id: "s30", text: "There's a new baby tapir at the zoo. The tapir is a close relative of the wild pig, and this one is tiny.", truth: false, known: "unknown", set: "Y", poster: "mayal" },                  // closer to horses/rhinos
  { id: "s31", text: "The planet Uranus was discovered by the scientist Galileo Galilei.", truth: false, known: "unknown", set: "Y", poster: "factcorner" }, // William Herschel
  { id: "s32", text: "Third coffee of the day ☕ Fun fact for the caffeine crew: the coffee plant originally comes from the forests of Brazil.", truth: false, known: "unknown", set: "Y", poster: "noamk" },   // Ethiopia

  // ---- Spares: swap like for like (same truth + known); keep the replaced item's id and set ----
  // { text: "Jupiter is the largest planet in our solar system.", truth: true, known: "known" },
  // { text: "The saxophone was invented by Adolphe Sax, who was born in Belgium.", truth: true, known: "unknown" },
  // { text: "The first paper money in history was used in China.", truth: true, known: "unknown" },
  // { text: "Most people in Brazil speak Spanish as their first language.", truth: false, known: "known" },   // Portuguese; don't combine with s32 (Brazil twice)
  // { text: "Biologists classify the bat as a type of bird.", truth: false, known: "known" },                  // mammal; probably too absurd
  // { text: "The dodo was a large bird that once lived on the island of Fiji.", truth: false, known: "unknown" }, // Mauritius
];

// Fictional Echo accounts that "post" the statements, so it reads like a feed.
// Each statement has a FIXED poster (its `poster` field = the account's handle),
// so a repeated post in Phase 2 is identical to Phase 1: same account, same words.
// People (Maya, Noam, Shira, Tal) post the casual-voice items; pages post the
// trivia-voice items. Balance: within each set, each true/false x known/unknown
// cell has 2 person + 2 page posts, and every account posts 1 true + 1 false per set.
export const POSTERS = [
  // img: path to the avatar picture. People = AI-generated faces (no real person),
  // pages = simple logos. If an image is missing, the initials are shown instead.
  { name: "Maya Levi",    handle: "mayal",       color: "#1560d4", img: "assets/avatars/maya.jpg" },
  { name: "Daily Trivia", handle: "dailytrivia", color: "#5b6b82", img: "assets/avatars/dailytrivia.svg" },
  { name: "Noam K.",      handle: "noamk",       color: "#2f7fe0", img: "assets/avatars/noam.jpg" },
  { name: "Fact Corner",  handle: "factcorner",  color: "#3a4a63", img: "assets/avatars/factcorner.svg" },
  { name: "Shira B.",     handle: "shirab",      color: "#0e4fae", img: "assets/avatars/shira.jpg" },
  { name: "Did You Know", handle: "didyouknow",  color: "#7a8799", img: "assets/avatars/didyouknow.svg" },
  { name: "Tal Cohen",    handle: "talc",        color: "#1f6fcf", img: "assets/avatars/tal.jpg" },
  { name: "Quick Facts",  handle: "quickfacts",  color: "#44546d", img: "assets/avatars/quickfacts.svg" },
];
