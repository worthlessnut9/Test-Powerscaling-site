// ===== TIER ORDER FOR THE WHOLE SITE =====
// This is the ONE place that decides how tiers are ordered. Edit BASE_TIERS and every page follows.
// List the tiers from weakest to strongest. Each one automatically gets a "+" version just above it.
//
// Tiers written like "1-C (X DIMENSIONS)" are variable: X is a number that changes per character
// (e.g. "1-C (7 Dimensions)"). Inside one of these tiers the order is by X first, and the "+" only
// beats the same X:  1-C (7)  <  1-C+ (7)  <  1-C (8)  <  1-C+ (8).
const BASE_TIERS = [
  "11-C",
  "11-B",
  "11-A",
  "LOW 10-C",
  "10-C",
  "10-B",
  "10-A",
  "9-C",
  "9-B",
  "9-A",
  "8-C",
  "HIGH 8-C",
  "8-B",
  "8-A",
  "LOW 7-C",
  "7-C",
  "HIGH 7-C",
  "LOW 7-B",
  "7-B",
  "7-A",
  "HIGH 7-A",
  "6-C",
  "HIGH 6-C",
  "LOW 6-B",
  "6-B",
  "HIGH 6-B",
  "6-A",
  "HIGH 6-A",
  "5-C",
  "LOW 5-B",
  "5-B",
  "5-A",
  "HIGH 5-A",
  "LOW 4-C",
  "4-C",
  "HIGH 4-C",
  "4-B",
  "4-A",
  "3-C",
  "3-B",
  "3-A",
  "HIGH 3-A",
  "LOW 2-C",
  "2-C",
  "2-C (X UNIVERSES)",
  "2-B",
  "2-A",
  "LOW 1-C",
  "1-C (X DIMENSIONS)",
  "HIGH 1-C (X DIMENSIONS)",
  "1-B (X DIMENSIONS)",
  "HIGH 1-B",
  "LOW 1-A",
  "1-A (X LAYERS)",
  "HIGH 1-A (X LAYERS)",
  "HIGH 1-A+ TYPE 1",   // High outerversal+ Type 1
  "HIGH 1-A+ TYPE 2",   // High outerversal+ Type 2
  "0"
];

const exactTierSequence = BASE_TIERS.flatMap((t) => [t, t + '+']);   // every tier and its "+" version, weakest to strongest
const SLOT = 1e6;   // room inside each tier for the X number

const normTier = (s) => String(s || '').toUpperCase().replace(/[\u2010-\u2015\u2212]/g, '-')   // fancy dashes from copy-paste -> plain "-"
  .replace(/\s+/g, ' ')
  .replace(/\+\s*(\((?:\d+|X) ?(?:DIMENSION|UNIVERSE|LAYER)S?\))/g, '$1+')   // "1-C+ (7 dimensions)" -> "1-C (7 dimensions)+"
  .replace(/ \(/g, '(');

const FAMILY = {};   // normalised tier name -> { fam: position among the base tiers, step: position in exactTierSequence }
BASE_TIERS.forEach((t, i) => { FAMILY[normTier(t)] = { fam: i, step: i * 2 }; });

const escTier = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TIER_RE = new RegExp('(?:^|[^\\w-])(' + Object.keys(FAMILY).sort((a, b) => b.length - a.length).map(escTier).join('|') + ')(\\+?)(?!\\w)');
const X_RE = /(?:^|[^\w-])((?:(?:LOW|HIGH) )?\d+-[ABC])\((\d+|X) ?(DIMENSION|UNIVERSE|LAYER)S?\)(\+?)/;

const isXFamily = (key) => key.includes('(X ');

// Reads a tier cell. Returns { family, rank, step, plus } or null if no tier is recognised.
//   rank: bigger = stronger (use this to sort and compare)
//   step: position in exactTierSequence, ignoring X (used for "how many tiers apart")
// If a cell lists a range such as "9-B to 9-A", the first tier found is used.
function parseTier(text) {
  const t = normTier(text);
  let m = t.match(X_RE);
  if (m) {
    const key = m[1] + '(X ' + m[3] + 'S)', f = FAMILY[key];
    if (f) {
      const x = m[2] === 'X' ? 0 : Math.min(+m[2], SLOT / 2 - 1), plus = m[4] ? 1 : 0;
      return { family: key, rank: f.fam * SLOT + x * 2 + plus, step: f.step + plus, plus };
    }
  }
  m = t.match(TIER_RE);
  if (!m) return null;
  const f = FAMILY[m[1]], plus = m[2] ? 1 : 0;
  return { family: m[1], rank: f.fam * SLOT + plus, step: f.step + plus, plus };
}

const parseTierWeight = (text) => { const r = parseTier(text); return r ? r.rank : null; };
const parseTierStep = (text) => { const r = parseTier(text); return r ? r.step : null; };

// Bounds for the tier-range filter. Picking a variable tier covers every X inside it.
const tierLowRank = (i) => parseTier(exactTierSequence[i]).rank;
function tierHighRank(i) {
  const r = parseTier(exactTierSequence[i]);
  return isXFamily(r.family) ? Math.floor(r.rank / SLOT) * SLOT + SLOT - 1 : r.rank;
}
