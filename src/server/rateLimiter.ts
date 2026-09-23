interface RateLimitEntry {
  timestamps: number[]
}

const memoryStore = new Map<string, RateLimitEntry>()

// Periodic cleanup of stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of memoryStore.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < 3600000) // keep max 1h
      if (entry.timestamps.length === 0) {
        memoryStore.delete(key)
      }
    }
  }, 300000)
  if (cleanupTimer.unref) cleanupTimer.unref()
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetMs: number
  limit: number
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - windowMs

  let entry = memoryStore.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    memoryStore.set(key, entry)
  }

  // Filter timestamps within current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart)

  if (entry.timestamps.length >= limit) {
    const oldestTimestamp = entry.timestamps[0] || now
    const resetMs = Math.max(0, oldestTimestamp + windowMs - now)
    return {
      allowed: false,
      remaining: 0,
      resetMs,
      limit,
    }
  }

  entry.timestamps.push(now)
  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    resetMs: windowMs,
    limit,
  }
}

export function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim()
  }
  return req.socket?.remoteAddress || '127.0.0.1'
}

export default checkRateLimit
