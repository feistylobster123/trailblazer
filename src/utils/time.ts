const KM_PER_MILE = 1.60934;

function clampSeconds(seconds: number): number {
  if (!isFinite(seconds) || isNaN(seconds)) return 0;
  return Math.max(0, Math.floor(seconds));
}

export function formatDuration(seconds: number): string {
  const s = clampSeconds(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function formatDurationShort(seconds: number): string {
  const s = clampSeconds(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

export function parseDuration(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length !== 3) return 0;
  const [hStr, mStr, sStr] = parts;
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const s = parseInt(sStr, 10);
  if (isNaN(h) || isNaN(m) || isNaN(s)) return 0;
  if (m < 0 || m > 59 || s < 0 || s > 59) return 0;
  return Math.max(0, h * 3600 + m * 60 + s);
}

export function formatPace(minPerKm: number): string {
  if (!isFinite(minPerKm) || isNaN(minPerKm) || minPerKm <= 0) return '--:--/km';
  const totalSeconds = Math.round(minPerKm * 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}/km`;
}

export function formatPaceMi(minPerKm: number): string {
  if (!isFinite(minPerKm) || isNaN(minPerKm) || minPerKm <= 0) return '--:--/mi';
  const minPerMi = minPerKm * KM_PER_MILE;
  const totalSeconds = Math.round(minPerMi * 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}/mi`;
}

export function formatTimeOfDay(isoString: string): string {
  if (!isoString) return '--';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(isoString: string): string {
  if (!isoString) return '--';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--';
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  const past = diffSec < 0;

  if (absSec < 60) return past ? 'just now' : 'in a moment';
  if (absSec < 3600) {
    const mins = Math.round(absSec / 60);
    return past ? `${mins} minute${mins !== 1 ? 's' : ''} ago` : `in ${mins} minute${mins !== 1 ? 's' : ''}`;
  }
  if (absSec < 86400) {
    const hours = Math.round(absSec / 3600);
    return past ? `${hours} hour${hours !== 1 ? 's' : ''} ago` : `in ${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  const days = Math.round(absSec / 86400);
  return past ? `${days} day${days !== 1 ? 's' : ''} ago` : `in ${days} day${days !== 1 ? 's' : ''}`;
}
