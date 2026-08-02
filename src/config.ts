export const CONFIG = {
  // Streaming — deux flux pour redondance future
  STREAM_PRIMARY:          import.meta.env.VITE_STREAM_PRIMARY || '',
  STREAM_BACKUP:           import.meta.env.VITE_STREAM_BACKUP  || '',

  // Watchdog player
  WATCHDOG_INTERVAL_MS:    5_000,
  WATCHDOG_STUCK_LIMIT:    3,
  WATCHDOG_TIMEOUT_MS:     15_000,
  PLAY_TIMEOUT_MS:         15_000,

  // Erreurs
  ERROR_THROTTLE_MS:       30_000,

  // Diffusion heure Tchad
  BROADCAST_START_HOUR:    17,
  BROADCAST_END_HOUR:      21,
  BROADCAST_TIMEZONE:      'Africa/Ndjamena',

  // Polling statut broadcast
  BROADCAST_POLL_MS:       60_000,

  // Edge Functions
  EDGE_TIMEOUT_MS:         5_000,
} as const
