(function () {
  const fill = document.getElementById("progress-fill");
  const raisedLabel = document.getElementById("raised-label");
  const goalLabel = document.getElementById("goal-label");
  const donateError = document.getElementById("donate-error");
  const emailInput = document.getElementById("donor-email");
  const modal = document.getElementById("custom-modal");
  const customAmount = document.getElementById("custom-amount");
  const customError = document.getElementById("custom-error");

  function showError(msg) {
    donateError.textContent = msg;
    donateError.classList.remove("hidden");
  }

  function clearError() {
    donateError.textContent = "";
    donateError.classList.add("hidden");
  }

  async function loadProgress() {
    try {
      const data = await MLCCCheckout.fetchFundraiserProgress();
      fill.style.width = data.percent + "%";
      raisedLabel.textContent =
        MLCCCheckout.formatUsd(data.raisedCents) + " raised";
      goalLabel.textContent =
        MLCCCheckout.formatUsd(data.goalCents) + " goal";
    } catch {
      goalLabel.textContent = "$25,000 goal";
    }
  }

  async function donate(tier, amountCents) {
    clearError();
    const buttons = document.querySelectorAll(".donate-card");
    buttons.forEach((b) => {
      b.disabled = true;
    });
    try {
      await MLCCCheckout.startFundraiserCheckout(tier, {
        amountCents,
        email: emailInput.value.trim() || undefined,
      });
    } catch (e) {
      showError(e.message || "Could not start checkout");
      buttons.forEach((b) => {
        b.disabled = false;
      });
    }
  }

  document.getElementById("donate-grid").addEventListener("click", (e) => {
    const card = e.target.closest("[data-tier]");
    if (!card) return;
    const tier = card.getAttribute("data-tier");
    if (tier === "custom") {
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
      customAmount.focus();
      return;
    }
    donate(tier);
  });

  document.getElementById("custom-cancel").addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    customError.classList.add("hidden");
  });

  document.getElementById("custom-submit").addEventListener("click", () => {
    const dollars = Number.parseFloat(customAmount.value, 10);
    if (!Number.isFinite(dollars) || dollars < 1) {
      customError.textContent = "Enter an amount of at least $1";
      customError.classList.remove("hidden");
      return;
    }
    const cents = Math.round(dollars * 100);
    donate("custom", cents);
  });

  loadProgress();
})();
