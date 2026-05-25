import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a duration given in seconds as MM:SS. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60).toString().padStart(2, '0');
  const s = (safe % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** Clamp a number into a [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
