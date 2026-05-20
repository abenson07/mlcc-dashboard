(function () {
  const el = document.querySelector("[data-mlcc-nav]");
  if (!el) return;
  el.className = "site-header";
  const inner = document.createElement("div");
  inner.className = "site-header__inner";
  const link = document.createElement("a");
  link.href = "https://mapleleafcommunity.org/";
  link.textContent = "maple leaf community council";
  inner.appendChild(link);
  el.appendChild(inner);
})();
