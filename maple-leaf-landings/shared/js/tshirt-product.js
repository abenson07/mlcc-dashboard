(function () {
  function renderSizeRow(container, category, sizes) {
    const items = MLCCCart.readCart();
    sizes.forEach((size) => {
      const row = document.createElement("div");
      row.className = "size-row";
      const qty = MLCCCart.getQty(items, category, size);

      const label = document.createElement("span");
      label.className = "size-label";
      label.textContent = size;

      const control = document.createElement("div");
      control.className = "qty-control";
      control.setAttribute("data-category", category);
      control.setAttribute("data-size", size);

      const minus = document.createElement("button");
      minus.type = "button";
      minus.setAttribute("aria-label", "Decrease");
      minus.textContent = "−";

      const count = document.createElement("span");
      count.textContent = String(qty);

      const plus = document.createElement("button");
      plus.type = "button";
      plus.setAttribute("aria-label", "Increase");
      plus.textContent = "+";

      control.append(minus, count, plus);
      row.append(label, control);
      container.appendChild(row);
    });
  }

  function bindQty(containerId) {
    document.getElementById(containerId).addEventListener("click", (e) => {
      const control = e.target.closest(".qty-control");
      if (!control || e.target.tagName !== "BUTTON") return;
      const category = control.getAttribute("data-category");
      const size = control.getAttribute("data-size");
      let items = MLCCCart.readCart();
      let qty = MLCCCart.getQty(items, category, size);
      const isPlus = e.target.getAttribute("aria-label") === "Increase";
      qty = isPlus ? qty + 1 : Math.max(0, qty - 1);
      items = MLCCCart.setQty(items, category, size, qty);
      MLCCCart.writeCart(items);
      control.querySelector("span").textContent = String(qty);
      updateContinue();
    });
  }

  function updateContinue() {
    const items = MLCCCart.readCart();
    const btn = document.getElementById("continue-btn");
    const total = MLCCCart.totalQuantity(items);
    btn.disabled = total < 1;
    document.getElementById("cart-summary").textContent =
      total > 0 ? MLCCCart.formatSummary(items) : "Select at least one shirt";
  }

  renderSizeRow(
    document.getElementById("adult-sizes"),
    "adult",
    MLCCCart.ADULT_SIZES
  );
  renderSizeRow(
    document.getElementById("child-sizes"),
    "child",
    MLCCCart.CHILD_SIZES
  );

  bindQty("adult-sizes");
  bindQty("child-sizes");

  document.getElementById("continue-btn").addEventListener("click", () => {
    window.location.href = "checkout.html";
  });

  updateContinue();
})();
