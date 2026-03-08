const KM_PER_MILE = 1.60934;
const FEET_PER_METER = 3.28084;

export function kmToMiles(km: number): number {
  if (!isFinite(km) || isNaN(km)) return 0;
  return km / KM_PER_MILE;
}

export function milesToKm(mi: number): number {
  if (!isFinite(mi) || isNaN(mi)) return 0;
  return mi * KM_PER_MILE;
}

export function metersToFeet(m: number): number {
  if (!isFinite(m) || isNaN(m)) return 0;
  return m * FEET_PER_METER;
}

export function feetToMeters(ft: number): number {
  if (!isFinite(ft) || isNaN(ft)) return 0;
  return ft / FEET_PER_METER;
}

export function formatDistance(km: number, unit: 'km' | 'mi' = 'km'): string {
  if (!isFinite(km) || isNaN(km)) return unit === 'km' ? '0.0 km' : '0.0 mi';
  if (unit === 'mi') {
    const miles = kmToMiles(km);
    return `${miles.toFixed(1)} mi`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatElevation(meters: number, unit: 'm' | 'ft' = 'm'): string {
  if (!isFinite(meters) || isNaN(meters)) return unit === 'm' ? '0 m' : '0 ft';
  if (unit === 'ft') {
    const feet = metersToFeet(meters);
    return `${Math.round(feet).toLocaleString('en-US')} ft`;
  }
  return `${Math.round(meters).toLocaleString('en-US')} m`;
}
