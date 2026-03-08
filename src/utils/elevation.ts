export function calculateGrade(elevationChangeM: number, distanceKm: number): number {
  if (!isFinite(elevationChangeM) || isNaN(elevationChangeM)) return 0;
  if (!isFinite(distanceKm) || isNaN(distanceKm) || distanceKm <= 0) return 0;
  const distanceM = distanceKm * 1000;
  return (elevationChangeM / distanceM) * 100;
}

export function calculateGAP(paceMinPerKm: number, gradePercent: number): number {
  if (!isFinite(paceMinPerKm) || isNaN(paceMinPerKm) || paceMinPerKm <= 0) return 0;
  if (!isFinite(gradePercent) || isNaN(gradePercent)) return paceMinPerKm;

  let costFactor: number;
  if (gradePercent > 0) {
    // Uphill
    costFactor = 1 + gradePercent * 0.033;
  } else if (gradePercent > -10) {
    // Mild downhill
    costFactor = 1 + gradePercent * 0.015;
  } else {
    // Steep downhill (grade <= -10)
    costFactor = 1 + gradePercent * 0.025;
  }

  // Prevent division by zero or negative cost factors
  if (costFactor <= 0) costFactor = 0.001;

  return paceMinPerKm / costFactor;
}

export function calculateVertRate(elevationGainM: number, timeSeconds: number): number {
  if (!isFinite(elevationGainM) || isNaN(elevationGainM) || elevationGainM < 0) return 0;
  if (!isFinite(timeSeconds) || isNaN(timeSeconds) || timeSeconds <= 0) return 0;
  const timeHours = timeSeconds / 3600;
  return elevationGainM / timeHours;
}

export function calculateClimbDifficulty(elevationGainM: number, distanceKm: number): number {
  if (!isFinite(elevationGainM) || isNaN(elevationGainM) || elevationGainM < 0) return 1;
  if (!isFinite(distanceKm) || isNaN(distanceKm) || distanceKm <= 0) return 1;

  // Combine absolute gain and gain-per-km into a single index
  // A race with 10,000m gain over 100km has 100m/km -- extremely hard
  // Reference: 10,000m over 100km = 10 (max difficulty)
  const gainPerKm = elevationGainM / distanceKm;
  const absoluteScore = Math.min(elevationGainM / 1000, 5); // 0-5 from absolute gain
  const densityScore = Math.min(gainPerKm / 20, 5);         // 0-5 from gain/km (100m/km = max)
  const raw = absoluteScore + densityScore;
  const clamped = Math.min(Math.max(raw, 0), 10);
  return Math.round(clamped * 10) / 10;
}
