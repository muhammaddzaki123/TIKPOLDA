// lib/session-manager.ts
// Manages active sessions and enforces single session per user

interface ActiveSession {
  userId: string;
  email: string;
  loginTime: number;
  ip: string;
}

// In-memory session tracking (production: use Redis)
const activeSessions = new Map<string, ActiveSession>();

export const sessionManager = {
  /**
   * Register new session and invalidate old ones for same user
   * Returns loginTime to be stored in JWT token
   */
  registerSession(userId: string, email: string, ip: string): number {
    const loginTime = Date.now();
    
    // Check if user already has active session
    const existingSession = activeSessions.get(userId);
    if (existingSession) {
      console.log(`[SESSION] Force logout previous session for user ${email}`);
      console.log(`[SESSION] Previous login: ${new Date(existingSession.loginTime).toISOString()}`);
      console.log(`[SESSION] New login: ${new Date(loginTime).toISOString()}`);
    }
    
    // Register new session (overwrites old one)
    activeSessions.set(userId, {
      userId,
      email,
      loginTime,
      ip,
    });
    
    console.log(`[SESSION] Active sessions: ${activeSessions.size}`);
    return loginTime;
  },

  /**
   * Check if session is valid (not replaced by newer login)
   * Allows 5 second tolerance for JWT token creation delay
   */
  isSessionValid(userId: string, loginTime: number): boolean {
    const session = activeSessions.get(userId);
    
    if (!session) {
      console.log(`[SESSION_MANAGER] No session found for user ${userId}`);
      return false; // No active session
    }
    
    // Session valid if login time matches (with 5 second tolerance)
    const timeDiff = Math.abs(session.loginTime - loginTime);
    const isValid = timeDiff < 5000; // 5 seconds tolerance
    
    console.log(`[SESSION_MANAGER] Validating session for user ${userId}`);
    console.log(`[SESSION_MANAGER] Session loginTime: ${new Date(session.loginTime).toISOString()}`);
    console.log(`[SESSION_MANAGER] Token loginTime: ${new Date(loginTime).toISOString()}`);
    console.log(`[SESSION_MANAGER] Time diff: ${timeDiff}ms, Valid: ${isValid}`);
    
    return isValid;
  },

  /**
   * Remove session on logout
   */
  removeSession(userId: string): void {
    const session = activeSessions.get(userId);
    if (session) {
      console.log(`[SESSION] Removing session for user ${session.email}`);
      activeSessions.delete(userId);
    }
  },

  /**
   * Get active session info
   */
  getSession(userId: string): ActiveSession | undefined {
    return activeSessions.get(userId);
  },

  /**
   * Get all active sessions (for admin monitoring)
   */
  getAllSessions(): ActiveSession[] {
    return Array.from(activeSessions.values());
  },

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(maxAgeMs: number = 8 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [userId, session] of activeSessions.entries()) {
      if (now - session.loginTime > maxAgeMs) {
        console.log(`[SESSION] Cleaning up expired session for ${session.email}`);
        activeSessions.delete(userId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[SESSION] Cleaned ${cleaned} expired sessions`);
    }
    
    return cleaned;
  },
};

// Auto cleanup every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    sessionManager.cleanupExpiredSessions();
  }, 60 * 60 * 1000); // 1 hour
}

export default sessionManager;
