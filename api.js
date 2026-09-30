/* ============================================================
   api.js — Mock verification API

   This module simulates the backend endpoint that would verify
   a token in a real deployment.

   To connect FOXEL to a real backend later, replace the internal
   logic of verifyToken() with a fetch() call, for example:

   const response = await fetch("/api/verify", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ token: normalized }),
   });

   return await response.json();
   ============================================================ */

const TokenApi = (() => {
  /**
   * Simulated network latency.
   * Makes the prototype feel like it is communicating with a backend.
   */
  const LATENCY_MS = 500;

  /**
   * Expected demo token format.
   *
   * This is intentionally simple. A real system may use different token
   * formats, checksums, prefixes, or opaque identifiers.
   */
  const TOKEN_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

  /**
   * Small promise-based delay helper.
   */
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Normalize token input.
   */
  function normalizeCode(code) {
    return (code || "").trim().toUpperCase();
  }

  /**
   * Verify a token.
   *
   * Verification order:
   * 1. Format check
   * 2. Record existence check
   * 3. Usage check
   * 4. Expiration check
   *
   * Returned shape:
   * {
   *   ok: boolean,
   *   reason?: string,
   *   record?: object
   * }
   *
   * Reasons:
   * - invalid_format
   * - no_matching_email
   * - already_used
   * - expired
   *
   * Security note:
   * For unknown or malformed tokens, no metadata is returned.
   * This reduces information leakage to potential attackers.
   */
  async function verifyToken(rawCode) {
    await wait(LATENCY_MS);

    const code = normalizeCode(rawCode);

    // 1. Basic format validation.
    if (!TOKEN_PATTERN.test(code)) {
      return { ok: false, reason: "invalid_format" };
    }

    // 2. Look up the mock server-side record.
    const record = MockTokenStore.findByCode(code);

    if (!record) {
      // Well-formed token, but no matching security email record.
      return { ok: false, reason: "no_matching_email" };
    }

    // 3. Check whether the token has already been consumed.
    if (record.usedAt) {
      return { ok: false, reason: "already_used", record };
    }

    // 4. Check whether the token is still inside its validity window.
    const now = new Date();
    const expiresAt = new Date(record.validUntil);

    if (now > expiresAt) {
      return { ok: false, reason: "expired", record };
    }

    // Success path.
    //
    // In production, this should atomically mark the token as used to prevent
    // race conditions and replay attempts.
    MockTokenStore.markUsed(record.code);

    return {
      ok: true,
      record,
    };
  }

  return {
    verifyToken,
  };
})();