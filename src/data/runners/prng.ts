// Seeded pseudo-random number generator utilities
// Uses mulberry32 algorithm for deterministic random number generation

export function createPRNG(seed: number): () => number {
  let s = seed | 0
  return function (): number {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededRandom(prng: () => number, min: number, max: number): number {
  return min + prng() * (max - min)
}

export function seededGaussian(prng: () => number, mean: number, stddev: number): number {
  // Box-Muller transform
  const u1 = prng()
  const u2 = prng()
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2)
  return mean + z * stddev
}

export function seededChoice<T>(prng: () => number, array: T[]): T {
  const index = Math.floor(prng() * array.length)
  return array[index]
}

export function seededShuffle<T>(prng: () => number, array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash >>> 0
}
