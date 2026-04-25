import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import axios from 'axios';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy HH:mm');
}

export function formatDateShort(iso: string): string {
  return format(parseISO(iso), 'MMM d');
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function truncateHash(hash: string, chars = 12): string {
  if (hash.length <= chars) return hash;
  return `${hash.slice(0, chars)}…`;
}

export function severityScoreLabel(score: number): string {
  if (score < 0.25) return 'Low';
  if (score < 0.5) return 'Medium';
  if (score < 0.75) return 'High';
  return 'Critical';
}

export function calcAcknowledgementRate(total: number, acknowledged: number): number {
  if (total === 0) return 0;
  return Math.round((acknowledged / total) * 100);
}

export function isApiError(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as Record<string, unknown>).message === 'string'
  );
}

export function extractErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const serverMessage = typeof data?.message === 'string' ? data.message : undefined;

    if (status === 409) return 'An account with this email already exists. Please sign in instead.';
    if (status === 401) return 'Invalid email or password.';
    if (status === 400) return serverMessage ?? 'Please check your input and try again.';
    if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
    if (!error.response) return 'Unable to reach the server. Please check your connection.';
    if (serverMessage) return serverMessage;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
