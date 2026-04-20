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
    <Sidebar collapsible="icon" {...props} className="hidden xl:block">
      <SidebarHeader>
        <div className="flex items-center h-[72px] border-b border-neutral-100 dark:border-slate-700 px-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-neutral-900 dark:bg-neutral-100"></div>
            <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
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
