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
  { id: "s01", text: "Mount Everest is the highest mountain in the world above sea level.", truth: true, known: "known", set: "X" },
  { id: "s02", text: "The blue whale is the largest animal alive in the world today.", truth: true, known: "known", set: "X" },
  { id: "s03", text: "At sea level, pure water boils at 100 degrees Celsius.", truth: true, known: "known", set: "X" },
  { id: "s04", text: "The Mona Lisa was painted by the Italian artist Leonardo da Vinci.", truth: true, known: "known", set: "X" },
  // true · unknown
  { id: "s05", text: "Thimphu is the capital city of the small Asian country Bhutan.", truth: true, known: "unknown", set: "X" },
  { id: "s06", text: "The okapi, an animal from central Africa, is a close relative of the giraffe.", truth: true, known: "unknown", set: "X" },
  { id: "s07", text: "Helium is the second most common element in the universe.", truth: true, known: "unknown", set: "X" },
  { id: "s08", text: "The potato was first grown as a food crop in South America.", truth: true, known: "unknown", set: "X" },
  // false · known            (real answer in the comment)
  { id: "s09", text: "The ancient Colosseum arena stands in the center of Naples.", truth: false, known: "known", set: "X" },        // Rome
  { id: "s10", text: "The giant panda is a wild animal native to Japan.", truth: false, known: "known", set: "X" },                 // China
  { id: "s11", text: "Venus is the planet that is closest to the Sun.", truth: false, known: "known", set: "X" },                  // Mercury
  { id: "s12", text: "Isaac Newton is the scientist who developed the theory of relativity.", truth: false, known: "known", set: "X" }, // Einstein
  // false · unknown
  { id: "s13", text: "The Danube River in Europe flows into the North Sea.", truth: false, known: "unknown", set: "X" },            // Black Sea
  { id: "s14", text: "The emu is a large running bird native to South Africa.", truth: false, known: "unknown", set: "X" },         // Australia
  { id: "s15", text: "In chemistry, the symbol for the element silver is Si.", truth: false, known: "unknown", set: "X" },          // Ag (Si = silicon)
  { id: "s16", text: "The first football World Cup was held in Argentina in 1930.", truth: false, known: "unknown", set: "X" },     // Uruguay

  // ---- Set Y (16) ----
  // true · known
  { id: "s17", text: "Cairo, on the Nile River, is the capital city of Egypt.", truth: true, known: "known", set: "Y" },
  { id: "s18", text: "The cheetah is the fastest land animal in the world.", truth: true, known: "known", set: "Y" },
  { id: "s19", text: "Light travels much faster through the air than sound does.", truth: true, known: "known", set: "Y" },
  { id: "s20", text: "The play Romeo and Juliet was written by William Shakespeare.", truth: true, known: "known", set: "Y" },
  // true · unknown
  { id: "s21", text: "The Atacama Desert is located in the north of Chile.", truth: true, known: "unknown", set: "Y" },
  { id: "s22", text: "The capybara is the largest rodent living in the world today.", truth: true, known: "unknown", set: "Y" },   // may be known: check in pre-test
  { id: "s23", text: "Bronze is a metal made mostly by mixing copper and tin.", truth: true, known: "unknown", set: "Y" },
  { id: "s24", text: "The first modern Olympic Games were held in Athens in 1896.", truth: true, known: "unknown", set: "Y" },    // may be known: check in pre-test
  // false · known
  { id: "s25", text: "The Statue of Liberty in New York was a gift from England.", truth: false, known: "known", set: "Y" },        // France
  { id: "s26", text: "Lisbon is the capital city of Spain.", truth: false, known: "known", set: "Y" },                              // Madrid (replaced "bats are birds": too absurd)
  { id: "s27", text: "Buzz Aldrin was the first person to walk on the Moon.", truth: false, known: "known", set: "Y" },             // Neil Armstrong
  { id: "s28", text: "The famous painting The Starry Night was made by Claude Monet.", truth: false, known: "known", set: "Y" },    // Van Gogh
  // false · unknown
  { id: "s29", text: "Yangon is the capital city of the Asian country Laos.", truth: false, known: "unknown", set: "Y" },           // Vientiane
  { id: "s30", text: "The tapir is a close relative of the wild pig.", truth: false, known: "unknown", set: "Y" },                  // closer to horses/rhinos
  { id: "s31", text: "The planet Uranus was discovered by the scientist Galileo Galilei.", truth: false, known: "unknown", set: "Y" }, // William Herschel
  { id: "s32", text: "The coffee plant originally comes from the forests of Brazil.", truth: false, known: "unknown", set: "Y" },   // Ethiopia

  // ---- Spares: swap like for like (same truth + known); keep the replaced item's id and set ----
  // { text: "Jupiter is the largest planet in our solar system.", truth: true, known: "known" },
  // { text: "The saxophone was invented by Adolphe Sax, who was born in Belgium.", truth: true, known: "unknown" },
  // { text: "The first paper money in history was used in China.", truth: true, known: "unknown" },
  // { text: "Most people in Brazil speak Spanish as their first language.", truth: false, known: "known" },   // Portuguese; don't combine with s32 (Brazil twice)
  // { text: "Biologists classify the bat as a type of bird.", truth: false, known: "known" },                  // mammal; probably too absurd
  // { text: "The dodo was a large bird that once lived on the island of Fiji.", truth: false, known: "unknown" }, // Mauritius
];

// Fictional Echo accounts that "post" the statements, so it reads like a feed.
// The poster is chosen by position in the feed, not by statement, so the same
// statement can appear from a different account in Phase 2 (only the text repeats).
export const POSTERS = [
  { name: "Maya Levi",    handle: "mayal",       color: "#1560d4" },
  { name: "Daily Trivia", handle: "dailytrivia", color: "#5b6b82" },
  { name: "Noam K.",      handle: "noamk",       color: "#2f7fe0" },
  { name: "Fact Corner",  handle: "factcorner",  color: "#3a4a63" },
  { name: "Shira B.",     handle: "shirab",      color: "#0e4fae" },
  { name: "Did You Know", handle: "didyouknow",  color: "#7a8799" },
  { name: "Tal Cohen",    handle: "talc",        color: "#1f6fcf" },
  { name: "Quick Facts",  handle: "quickfacts",  color: "#44546d" },
];
