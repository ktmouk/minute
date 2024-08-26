"use client";

import { TabGroup, TabPanels } from "@headlessui/react";
import { SidebarNav } from "../_components/SidebarNav";
import { SidebarTabList } from "../_components/SidebarTabList";
import { AccountMenu } from "./AccountMenu";
import { SidebarCategoryPanel } from "./SidebarCategoryPanel";
import { SidebarFolderPanel } from "./SidebarFolderPanel";

export const Sidebar = () => {
  return (
    <TabGroup className="sticky left-0 top-0 w-80 max-h-screen h-screen flex justify-between border-r border-gray-300 bg-gray-100 pt-6 flex-col">
      <div className="mb-5">
        <SidebarNav />
      </div>
      <SidebarTabList />
      <div className="flex-1 pt-4 overflow-y-auto custom-scrollbar">
        <TabPanels>
          <SidebarFolderPanel />
          <SidebarCategoryPanel />
        </TabPanels>
      </div>
      <div className="shrink-0">
        <AccountMenu />
      </div>
    </TabGroup>
  );
};
