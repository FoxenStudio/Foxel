/* ============================================================
   tokens.js — Mock token database

   This module simulates the server-side record store.

   IMPORTANT:
   In production, raw tokens should never be stored in plaintext.
   A real system would store only a cryptographic hash of the token,
   for example SHA-256(token), and compare hashes during verification.

   In this browser prototype, raw demo codes are stored locally so the
   demo remains simple and self-contained.
   ============================================================ */

const MockTokenStore = (() => {
  /**
   * Helper: create an ISO timestamp a given number of minutes in the past.
   */
  const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

  /**
   * Helper: create an ISO timestamp a given number of minutes in the future.
   */
  const minutesLater = (m) => new Date(Date.now() + m * 60 * 1000).toISOString();

  /**
   * Normalize token input.
   *
   * This ensures that lookup and consumption behave consistently:
   * - trims surrounding whitespace
   * - converts to uppercase
   */
  function normalizeCode(code) {
    return (code || "").trim().toUpperCase();
  }

  /**
   * Mock token records.
   *
   * Each record represents a security email that would have been generated
   * by a real service. All services here are fictional:
   * - NOVA ID
   * - ORBIT ACCOUNT
   *
   * Validity is intentionally derived from:
   * - usedAt: if present, token has already been consumed
   * - validUntil: if in the past, token is expired
   *
   * This avoids storing a potentially stale "valid" status.
   */
  const tokens = {
    // 1) Valid, unused token
    "FX8K-2M4P-Q9R7": {
      id: "tok_9f2a1c4e8b7d",
      code: "FX8K-2M4P-Q9R7",
      sender: "NOVA ID",
      emailType: "Password reset",
      sentAt: minutesAgo(4),
      createdAt: minutesAgo(5),
      validUntil: minutesLater(25),
      securityEventId: "evt_a1b2c3d4e5f6",
      userInitiated: true,
      device: "Desktop",
      browser: "Chrome 126",
      os: "Windows 11",
      approximateLocation: "Berlin, DE",
      maskedIp: "203.0.***.***",
      usedAt: null,
    },

    // 2) Expired token
    "FX3N-7B2V-L5T1": {
      id: "tok_7e3f9a1b2c4d",
      code: "FX3N-7B2V-L5T1",
      sender: "ORBIT ACCOUNT",
      emailType: "Login confirmation",
      sentAt: minutesAgo(95),
      createdAt: minutesAgo(96),
      validUntil: minutesAgo(66),
      securityEventId: "evt_f6e5d4c3b2a1",
      userInitiated: true,
      device: "Mobile",
      browser: "Safari 17",
      os: "iOS 17",
      approximateLocation: "Istanbul, TR",
      maskedIp: "178.24.***.***",
      usedAt: null,
    },

    // 3) Already used token
    "FX6W-9C8H-J4Y3": {
      id: "tok_2b4c6d8e1f3a",
      code: "FX6W-9C8H-J4Y3",
      sender: "NOVA ID",
      emailType: "Two-factor setup",
      sentAt: minutesAgo(40),
      createdAt: minutesAgo(41),
      validUntil: minutesLater(19),
      securityEventId: "evt_1a2b3c4d5e6f",
      userInitiated: true,
      device: "Desktop",
      browser: "Firefox 128",
      os: "macOS 14",
      approximateLocation: "Amsterdam, NL",
      maskedIp: "92.11.***.***",
      usedAt: minutesAgo(12),
    },

    // 4) No matching email scenario
    // FX00-0000-0000 is intentionally absent from this store.
  };

  /**
   * Find a token record by code.
   *
   * @param {string} code Raw token code entered by the user.
   * @returns {object|null} Matching record or null.
   */
  function findByCode(code) {
    const normalized = normalizeCode(code);
    return tokens[normalized] || null;
  }

  /**
   * Mark a token as used.
   *
   * In production this should be an atomic server-side operation, for example:
   * UPDATE tokens SET used_at = NOW() WHERE token_hash = ? AND used_at IS NULL
   *
   * @param {string} code Raw token code.
   */
  function markUsed(code) {
    const normalized = normalizeCode(code);
    const token = tokens[normalized];

    if (!token) return;

    token.usedAt = new Date().toISOString();
  }

  return {
    findByCode,
    markUsed,
  };
})();