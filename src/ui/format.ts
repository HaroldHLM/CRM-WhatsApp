import { daysSince } from '../domain/lead';

/** "hoy", "ayer" o "hace N d". */
export function agoLabel(iso: string, now: Date = new Date()): string {
  const d = daysSince(iso, now);
  if (d <= 0) return 'hoy';
  if (d === 1) return 'ayer';
  return `hace ${d} d`;
}
