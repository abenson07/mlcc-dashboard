(function (global) {
  const CART_KEY = "mlcc_tshirt_cart";

  const ADULT_SIZES = ["XS", "S", "M", "L", "XL"];
  const CHILD_SIZES = ["XS", "S", "M", "L", "XL"];

  function readCart() {
    try {
      const raw = sessionStorage.getItem(CART_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeCart(items) {
    sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function getQty(items, category, size) {
    const line = items.find(
      (i) => i.category === category && i.size === size
    );
    return line ? line.quantity : 0;
  }

  function setQty(items, category, size, quantity) {
    const next = items.filter(
      (i) => !(i.category === category && i.size === size)
    );
    if (quantity > 0) {
      next.push({ category, size, quantity });
    }
    return next;
  }

  function totalQuantity(items) {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }

  function formatSummary(items) {
    if (!items.length) return "No items selected";
    return items
      .map((i) => {
        const group = i.category === "adult" ? "Adult" : "Kids";
        return `${i.quantity}× ${group} ${i.size}`;
      })
      .join(", ");
  }

  global.MLCCCart = {
    CART_KEY,
    ADULT_SIZES,
    CHILD_SIZES,
    readCart,
    writeCart,
    getQty,
    setQty,
    totalQuantity,
    formatSummary,
  };
})(window);
