/* ============================================================
   app.js — Glue code
   Wires DOM events to the API and UI modules.
   ============================================================ */

(function () {
  "use strict";

  // ---- DOM references ----
  const form          = document.getElementById("verify-form");
  const tokenInput    = document.getElementById("token-input");
  const pasteBtn      = document.getElementById("paste-btn");
  const detailedChk   = document.getElementById("detailed-mode");
  const verifyBtn     = document.getElementById("verify-btn");
  const btnLabel      = verifyBtn.querySelector(".btn-label");
  const btnLoader     = verifyBtn.querySelector(".btn-loader");
  const statusEl      = document.getElementById("status");

  const resultCard    = document.getElementById("result-card");
  const resultSummary = document.getElementById("result-summary");
  const resultDetail  = document.getElementById("result-detailed");
  const detailedSec   = document.getElementById("detailed-section");
  const verifyAnother = document.getElementById("verify-another-btn");

  const failureCard   = document.getElementById("failure-card");
  const failureSub    = document.getElementById("failure-sub");
  const failureReasons= document.getElementById("failure-reasons");
  const tryAgainBtn   = document.getElementById("try-again-btn");

  // ---- Helpers ----
  function setLoading(isLoading) {
    verifyBtn.disabled = isLoading;
    btnLabel.textContent = isLoading ? "Verifying…" : "Verify Token";
    btnLoader.hidden = !isLoading;
  }

  function showStatus(message, kind) {
    statusEl.hidden = false;
    statusEl.className = "status " + kind; // "ok" | "err"
    statusEl.textContent = message;
  }
  function hideStatus() {
    statusEl.hidden = true;
    statusEl.textContent = "";
  }

  function resetView() {
    resultCard.hidden = true;
    failureCard.hidden = true;
    hideStatus();
  }

  // ---- Event: form submit ----
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideStatus();
    resetView();

    const code = tokenInput.value.trim().toUpperCase();
    if (!code) {
      showStatus("Please enter a verification code.", "err");
      tokenInput.focus();
      return;
    }

    setLoading(true);
    try {
      const result = await TokenApi.verifyToken(code);

      if (result.ok) {
        // Success path
        resultSummary.innerHTML = UI.renderSummary(result.record);
        resultDetail.innerHTML  = UI.renderDetailed(result.record);
        detailedSec.hidden = !detailedChk.checked;
        resultCard.hidden = false;
        resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Failure path — do NOT leak detailed info for invalid tokens
        failureSub.textContent = UI.setFailureSubtitle(result.reason);
        failureReasons.innerHTML = UI.renderFailureReasons(result.reason);
        failureCard.hidden = false;
        failureCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err) {
      // Network / unexpected error
      showStatus("Something went wrong. Please try again.", "err");
      console.error(err);
    } finally {
      setLoading(false);
    }
  });

  // ---- Event: paste button ----
  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      tokenInput.value = text.trim();
      tokenInput.focus();
    } catch {
      showStatus("Clipboard access was denied. Paste manually.", "err");
    }
  });

  // ---- Event: toggle detailed mode on success screen ----
  detailedChk.addEventListener("change", () => {
    if (!resultCard.hidden) {
      detailedSec.hidden = !detailedChk.checked;
    }
  });

  // ---- Event: verify another / try again ----
  verifyAnother.addEventListener("click", () => {
    resetView();
    tokenInput.value = "";
    tokenInput.focus();
  });
  tryAgainBtn.addEventListener("click", () => {
    resetView();
    tokenInput.value = "";
    tokenInput.focus();
  });

  // ---- Event: demo token chips ----
  document.querySelectorAll(".chip[data-token]").forEach(chip => {
    chip.addEventListener("click", () => {
      tokenInput.value = chip.dataset.token;
      tokenInput.focus();
      // Optional: auto-submit for a snappier demo feel
      // form.requestSubmit();
    });
  });
})();