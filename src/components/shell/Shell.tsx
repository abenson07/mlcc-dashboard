import type { ReactNode } from "react";
import Navigation from "./Navigation";

type ShellProps = {
  children: ReactNode;
  nav?: ReactNode;
};

export default function Shell({ children, nav }: ShellProps) {
  return (
    <div className="shell-app">
      <div className="shell-root">
        {nav ?? <Navigation />}
        <div className="shell-canvas-col">{children}</div>
      </div>
    </div>
  );
}
