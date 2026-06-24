"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export function ClientRoot({
  defaultOpen,
  children,
}: {
  defaultOpen: boolean;
  children: ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className="dashboard-body-wrapper grow-[1] flex flex-col">
          <SidebarInset>
            <Header />
          </SidebarInset>
          <div className="dashboard-body flex-1 bg-[#FBF6F0] p-4 md:p-6 dark:bg-neutral-950">
            {children}
          </div>
        </main>
        <Toaster position="top-center" reverseOrder={false} />
      </SidebarProvider>
    </ThemeProvider>
  );
}
