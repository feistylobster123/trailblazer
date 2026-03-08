const EARTH_RADIUS_KM = 6371;

export function distanceBetweenPoints(p1: [number, number], p2: [number, number]): number {
  // Haversine formula. p1 and p2 are [lng, lat].
  const lat1 = (p1[1] * Math.PI) / 180;
  const lat2 = (p2[1] * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLng = ((p2[0] - p1[0]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function calculateBearing(p1: [number, number], p2: [number, number]): number {
  // p1 and p2 are [lng, lat]. Returns bearing in degrees (0-360).
  const lat1 = (p1[1] * Math.PI) / 180;
  const lat2 = (p2[1] * Math.PI) / 180;
  const dLng = ((p2[0] - p1[0]) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

export function calculateTotalDistance(coordinates: number[][]): number {
  if (!coordinates || coordinates.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];
    if (p1.length >= 2 && p2.length >= 2) {
      total += distanceBetweenPoints(
        [p1[0], p1[1]],
        [p2[0], p2[1]],
      );
    }
  }
  return total;
}

export function interpolateAlongLine(
  coordinates: number[][],
  fraction: number,
): [number, number, number] {
  if (!coordinates || coordinates.length === 0) return [0, 0, 0];

  const clampedFraction = Math.min(1, Math.max(0, fraction));

  if (coordinates.length === 1) {
    const pt = coordinates[0];
    return [pt[0] ?? 0, pt[1] ?? 0, pt[2] ?? 0];
  }

  // Build cumulative distance array
  const cumulative: number[] = [0];
  for (let i = 0; i < coordinates.length - 1; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];
    const d = distanceBetweenPoints([p1[0], p1[1]], [p2[0], p2[1]]);
    cumulative.push(cumulative[i] + d);
  }

  const totalDist = cumulative[cumulative.length - 1];

  if (totalDist === 0) {
    const pt = coordinates[0];
    return [pt[0] ?? 0, pt[1] ?? 0, pt[2] ?? 0];
  }

  const targetDist = clampedFraction * totalDist;

  // Find the segment containing targetDist
  let segIdx = 0;
  for (let i = 0; i < cumulative.length - 1; i++) {
    if (targetDist <= cumulative[i + 1]) {
      segIdx = i;
      break;
    }
    segIdx = i;
  }

  const segStart = cumulative[segIdx];
  const segEnd = cumulative[segIdx + 1];
  const segLen = segEnd - segStart;

  const t = segLen > 0 ? (targetDist - segStart) / segLen : 0;

  const a = coordinates[segIdx];
  const b = coordinates[segIdx + 1];

  const lng = (a[0] ?? 0) + t * ((b[0] ?? 0) - (a[0] ?? 0));
  const lat = (a[1] ?? 0) + t * ((b[1] ?? 0) - (a[1] ?? 0));
  const ele = ((a[2] ?? 0) + t * ((b[2] ?? 0) - (a[2] ?? 0)));

  return [lng, lat, ele];
}
