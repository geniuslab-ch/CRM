// Deterministic pseudo-random generator so demo data is stable
// across server render and client hydration (no Math.random()).

export function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed: number) {
  const rand = mulberry32(seed);
  return {
    next: () => rand(),
    int: (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min,
    pick<T>(arr: readonly T[]): T {
      return arr[Math.floor(rand() * arr.length)];
    },
    pickMultiple<T>(arr: readonly T[], count: number): T[] {
      const copy = [...arr];
      const out: T[] = [];
      for (let i = 0; i < count && copy.length > 0; i++) {
        const idx = Math.floor(rand() * copy.length);
        out.push(copy[idx]);
        copy.splice(idx, 1);
      }
      return out;
    },
    bool: (probability = 0.5) => rand() < probability,
    daysAgoISO: (maxDays: number, minDays = 0) => {
      const base = new Date("2026-08-21T12:00:00Z").getTime();
      const days = minDays + Math.floor(rand() * (maxDays - minDays));
      return new Date(base - days * 86400000).toISOString();
    },
  };
}

export const SWISS_CITIES = [
  "Lausanne",
  "Geneva",
  "Yverdon",
  "Montreux",
  "Vevey",
  "Neuchâtel",
  "Fribourg",
  "Bern",
  "Zurich",
  "Basel",
] as const;
