(function () {
  const summaryEl = document.getElementById("cart-summary");
  const errorEl = document.getElementById("checkout-error");
  const form = document.getElementById("checkout-form");

  const cart = MLCCCart.readCart();
  if (MLCCCart.totalQuantity(cart) < 1) {
    window.location.href = "index.html";
    return;
  }

  summaryEl.textContent = MLCCCart.formatSummary(cart);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.classList.add("hidden");
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;

    const customer = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      addressLine1: form.addressLine1.value.trim(),
      addressLine2: form.addressLine2.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      postalCode: form.postalCode.value.trim(),
    };

    try {
      await MLCCCheckout.startTshirtCheckout(cart, customer);
    } catch (err) {
      errorEl.textContent = err.message || "Checkout failed";
      errorEl.classList.remove("hidden");
      submit.disabled = false;
    }
  });
})();
