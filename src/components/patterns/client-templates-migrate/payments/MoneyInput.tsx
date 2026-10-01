"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { fieldInputStyle } from "./checkEntryStyles";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "type" | "inputMode">;

/** Amount field with a fixed "$" prefix that is not part of the editable value. */
export const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(props, ref) {
  return (
    <div style={{ position: "relative" }}>
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 12,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          fontSize: 14,
          color: "var(--linear-color-ink-subtle)",
          pointerEvents: "none",
        }}
      >
        $
      </span>
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        {...props}
        style={{ ...fieldInputStyle, paddingLeft: 26 }}
      />
    </div>
  );
});
