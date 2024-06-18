"use client";

import { TabPanel } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PiPlus } from "react-icons/pi";
import { trpc } from "../_components/TrpcProvider";
import { CategoryModal } from "./CategoryModal";
import { CategoryTreeItem } from "./CategoryTreeItem";

export const SidebarCategoryPanel = () => {
  const t = useTranslations("components.SidebarCategoryPanel");

  const allCategories = trpc.categories.getAllCategories.useQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <TabPanel>
      <ul>
        {allCategories.data?.map((category) => (
          <CategoryTreeItem
            key={category.id}
            id={category.id}
            color={category.color}
            emoji={category.emoji}
            name={category.name}
            folderIds={category.categoryFolders.map(({ folderId }) => folderId)}
          />
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          setIsModalOpen(true);
        }}
        className="flex items-center w-full my-2.5 px-4 py-1.5 text-sm gap-2 hover:bg-gray-200"
      >
        <PiPlus className="text-base" />
        {t("addNewCategory")}
      </button>
      {isModalOpen && (
        <CategoryModal
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}
    </TabPanel>
  );
};
