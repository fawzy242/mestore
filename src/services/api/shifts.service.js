/**
 * Shifts service — future backend integration point.
 *
 * The current MVP manages shift state entirely client-side via
 * `src/features/shift/composables/useShift.js` (which persists the drawer
 * amount, running sales total, and open/closed flag to localStorage).
 *
 * No code currently imports this module. When the backend contract for the
 * shift lifecycle is confirmed, the three functions below become real
 * `httpClient` calls, and `useShift` is refactored to call them instead of
 * touching localStorage directly.
 *
 * Function shapes below mirror the signature useShift would need:
 *   openShift({ startingCash }) -> { startingCash, salesTotal, openedAt }
 *   closeShift({ countedCash }) -> { expected, counted, variance, closedAt }
 *   getShiftSummary()          -> { startingCash, salesTotal, expected }
 */

import httpClient from '@/services/http/httpClient.js'

export function openShift(payload) {
  return httpClient.post('/shifts/open', payload)
}

export function closeShift(payload) {
  return httpClient.post('/shifts/close', payload)
}

export function getShiftSummary() {
  return httpClient.get('/shifts/current')
}