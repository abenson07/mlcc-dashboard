import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import React from "react";

const AUTH_PANEL_IMAGE =
  "https://i.redd.it/gmxo7sp1cz791.jpg";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
        {children}
        <div
          className="lg:w-1/2 w-full h-full hidden lg:block bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${AUTH_PANEL_IMAGE})` }}
        />
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
