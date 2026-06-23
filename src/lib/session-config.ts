/** Idle session length in minutes (env `SESSION_IDLE_MINUTES`, default 30). */
const DEFAULT_IDLE_MINUTES = 30;

function parseIdleMinutes(): number {
  const raw = process.env.SESSION_IDLE_MINUTES;
  if (!raw) return DEFAULT_IDLE_MINUTES;
  const minutes = Number.parseInt(raw, 10);
  if (!Number.isFinite(minutes) || minutes <= 0) return DEFAULT_IDLE_MINUTES;
  return minutes;
}

/** Session expires after this many seconds without activity (sliding idle timeout). */
export const SESSION_IDLE_TIMEOUT_SECONDS = parseIdleMinutes() * 60;
