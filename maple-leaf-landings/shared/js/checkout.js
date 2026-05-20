(function (global) {
  function getConfig() {
    return global.MLCC_CONFIG || {};
  }

  function apiBase() {
    const base = getConfig().apiBase;
    if (!base) {
      throw new Error("MLCC_CONFIG.apiBase is not set");
    }
    return base.replace(/\/$/, "");
  }

  function returnOrigin() {
    return (
      getConfig().returnOrigin ||
      global.location.origin
    ).replace(/\/$/, "");
  }

  async function postJson(path, body) {
    const res = await fetch(`${apiBase()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }

  async function startTshirtCheckout(cart, customer) {
    const data = await postJson("/api/public/checkout/tshirt", {
      items: cart,
      customer,
      returnOrigin: returnOrigin(),
    });
    if (data.url) global.location.href = data.url;
    return data;
  }

  async function startFundraiserCheckout(tier, options) {
    const body = {
      tier,
      returnOrigin: returnOrigin(),
    };
    if (options?.amountCents != null) body.amountCents = options.amountCents;
    if (options?.email) body.email = options.email;
    const data = await postJson("/api/public/checkout/fundraiser", body);
    if (data.url) global.location.href = data.url;
    return data;
  }

  async function fetchFundraiserProgress() {
    const res = await fetch(
      `${apiBase()}/api/public/fundraiser/progress`
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Failed to load progress");
    }
    return data;
  }

  function formatUsd(cents) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }

  global.MLCCCheckout = {
    startTshirtCheckout,
    startFundraiserCheckout,
    fetchFundraiserProgress,
    formatUsd,
  };
})(window);
