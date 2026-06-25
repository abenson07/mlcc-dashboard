"use client";

import { Toaster } from "sonner";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { DevLinkProvider } from "@/devlink/DevLinkProvider";
import AgentationDev from "@/components/dev/AgentationDev";
import FeedbackFab from "@/components/feedback/FeedbackFab";
import { GlobalSearchProvider } from "@/components/search/GlobalSearchProvider";

export default function AdminProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <DevLinkProvider>
          <SidebarProvider>
            <GlobalSearchProvider>{children}</GlobalSearchProvider>
          </SidebarProvider>
        </DevLinkProvider>
      </ThemeProvider>
      <Toaster richColors position="bottom-right" />
      <FeedbackFab />
      <AgentationDev />
    </QueryProvider>
  );
}
