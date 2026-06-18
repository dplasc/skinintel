"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { data } from "./sidebar-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="hidden border-e border-[#ECE0D4] xl:block dark:border-neutral-800 [&_[data-slot=sidebar-inner]]:bg-[#FBF6F0] dark:[&_[data-slot=sidebar-inner]]:bg-neutral-950"
    >
      <SidebarHeader className="p-0">
        <div className="flex h-[76px] items-center border-b border-[#ECE0D4] px-5 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#D9734E] to-[#E0976F] shadow-[0_2px_8px_rgba(217,115,78,0.35)]"></div>
            <span className="text-lg font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">
              SkinIntel
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin scrollbar-invisible hover:scrollbar-visible">
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
