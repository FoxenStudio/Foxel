/* ============================================================
   ui.js — UI rendering helpers

   This module contains pure-ish rendering functions.
   It does not directly handle user events.
   ============================================================ */

const UI = (() => {
  /**
   * Escape untrusted strings before inserting them into innerHTML.
   *
   * Even though this prototype uses mock data, escaping is a good habit and
   * becomes important when data comes from a real backend.
   */
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      switch (char) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return char;
      }
    });
  }

  /**
   * Format an ISO date as a human-readable date/time string.
   */
  function formatDate(iso) {
    const date = new Date(iso);

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Convert an ISO date into a short relative label.
   * Example: "4 min ago", "2 h ago", "in 25 min".
   */
  function formatRelative(iso) {
    const target = new Date(iso).getTime();
    const diffMs = Date.now() - target;
    const absMs = Math.abs(diffMs);

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (absMs < minute) {
      return diffMs >= 0 ? "just now" : "in less than a minute";
    }

    if (absMs < hour) {
      const mins = Math.round(absMs / minute);
      return diffMs >= 0 ? `${mins} min ago` : `in ${mins} min`;
    }

    if (absMs < day) {
      const hours = Math.round(absMs / hour);
      return diffMs >= 0 ? `${hours} h ago` : `in ${hours} h`;
    }

    const days = Math.round(absMs / day);
    return diffMs >= 0 ? `${days} d ago` : `in ${days} d`;
  }

  /**
   * Calculate whole minutes between two ISO timestamps.
   */
  function minutesBetween(startIso, endIso) {
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    return Math.max(0, Math.round((end - start) / 60000));
  }

  /**
   * Render the short success summary.
   *
   * This is shown for every successful verification.
   */
  function renderSummary(record) {
    const rows = [
      ["Sender", escapeHtml(record.sender)],
      ["Email type", escapeHtml(record.emailType)],
      [
        "Sent",
        `${escapeHtml(formatDate(record.sentAt))} · ${escapeHtml(
          formatRelative(record.sentAt)
        )}`,
      ],
      ["Token status", `<span class="pill valid">Valid</span>`],
      ["Token usage", `<span class="pill unused">Unused</span>`],
    ];

    return rows.map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`).join("");
  }

  /**
   * Render detailed security information.
   *
   * This should only be used for successful verification results.
   * Do not expose detailed metadata for invalid or unknown tokens.
   */
  function renderDetailed(record) {
    const validityMinutes = minutesBetween(record.createdAt, record.validUntil);

    const rows = [
      ["Sent at", formatDate(record.sentAt)],
      ["Email type", record.emailType],
      ["Token created", formatDate(record.createdAt)],
      ["Valid for", `${validityMinutes} minutes`],
      ["Valid until", formatDate(record.validUntil)],
      ["Security event ID", record.securityEventId],
      ["User-initiated", record.userInitiated ? "Yes" : "No"],
      ["Device", record.device],
      ["Browser", record.browser],
      ["Operating system", record.os],
      ["Approx. location", record.approximateLocation],
      ["IP masked", record.maskedIp],
    ];

    return rows
      .map(([key, value]) => {
        return `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`;
      })
      .join("");
  }

  /**
   * Render the failure reason checklist.
   *
   * The active reason is highlighted.
   */
  function renderFailureReasons(reason) {
    const reasons = [
      { key: "invalid_format", label: "Invalid token" },
      { key: "expired", label: "Expired token" },
      { key: "already_used", label: "Already used" },
      { key: "no_matching_email", label: "No matching email" },
    ];

    return reasons
      .map((item) => {
        const isActive = item.key === reason;
        return `
          <div class="failure-reason ${isActive ? "active" : ""}">
            <span class="dot" aria-hidden="true"></span>
            <span>${escapeHtml(item.label)}</span>
          </div>
        `;
      })
      .join("");
  }

  /**
   * Return a short, safe subtitle for each failure reason.
   *
   * These messages avoid leaking sensitive metadata.
   */
  function failureSubtitle(reason) {
    switch (reason) {
      case "invalid_format":
        return "The code format is not recognized.";
      case "no_matching_email":
        return "No security email matches this code.";
      case "expired":
        return "This code existed, but its verification window has closed.";
      case "already_used":
        return "This code has already been verified once.";
      default:
        return "The token you entered does not match any usable record.";
    }
  }

  return {
    renderSummary,
    renderDetailed,
    renderFailureReasons,
    failureSubtitle,
    escapeHtml,
  };
})();