export function formatNumber(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0';
  return Math.round(n).toLocaleString('en-US');
}

export function formatOrdinal(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0th';
  const abs = Math.abs(Math.floor(n));
  const mod100 = abs % 100;
  const mod10 = abs % 10;

  let suffix: string;
  if (mod100 >= 11 && mod100 <= 13) {
    suffix = 'th';
  } else if (mod10 === 1) {
    suffix = 'st';
  } else if (mod10 === 2) {
    suffix = 'nd';
  } else if (mod10 === 3) {
    suffix = 'rd';
  } else {
    suffix = 'th';
  }

  return `${abs}${suffix}`;
}

export function formatPercentage(n: number, decimals: number = 1): string {
  if (!isFinite(n) || isNaN(n)) return '0%';
  const d = Math.max(0, Math.floor(decimals));
  return `${n.toFixed(d)}%`;
}

export function formatCompactNumber(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    return `${sign}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    const val = abs / 1_000;
    return `${sign}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}k`;
  }
  return `${sign}${abs}`;
}
