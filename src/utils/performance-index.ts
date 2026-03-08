// ITRA-style Performance Index utilities.
// Reference time model: a 500-PI runner is expected to finish in:
//   referenceTimeHours = (distanceKm / 8) + (elevationGainM / 400)

export function calculatePI(
  finishTimeSeconds: number,
  distanceKm: number,
  elevationGainM: number,
): number {
  if (!isFinite(finishTimeSeconds) || isNaN(finishTimeSeconds) || finishTimeSeconds <= 0) return 0;
  if (!isFinite(distanceKm) || isNaN(distanceKm) || distanceKm <= 0) return 0;
  if (!isFinite(elevationGainM) || isNaN(elevationGainM) || elevationGainM < 0) return 0;

  const referenceTimeHours = (distanceKm / 8) + (elevationGainM / 400);
  const referenceTimeSeconds = referenceTimeHours * 3600;
  const pi = (referenceTimeSeconds / finishTimeSeconds) * 500;
  return Math.min(1000, Math.max(0, Math.round(pi)));
}

export function categorizePI(pi: number): string {
  if (!isFinite(pi) || isNaN(pi) || pi < 0) return 'newcomer';
  if (pi >= 800) return 'elite';
  if (pi >= 650) return 'sub_elite';
  if (pi >= 500) return 'competitive';
  if (pi >= 350) return 'mid_pack';
  if (pi >= 200) return 'back_pack';
  return 'newcomer';
}

export function piToColor(pi: number): string {
  const category = categorizePI(pi);
  switch (category) {
    case 'elite':     return '#FFD700'; // gold
    case 'sub_elite': return '#C0C0C0'; // silver
    case 'competitive': return '#CD7F32'; // bronze
    case 'mid_pack':  return '#52B788'; // trail green
    case 'back_pack': return '#636E72'; // slate
    default:          return '#B2BEC3'; // light gray (newcomer)
  }
}
