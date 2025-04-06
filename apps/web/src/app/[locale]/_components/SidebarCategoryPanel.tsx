"use client";

import { TabPanel } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PiPlus, PiQuestion } from "react-icons/pi";
import { Link } from "../../../i18n/navigation";
import { trpc } from "../_components/TrpcProvider";
import { CategoryModal } from "./CategoryModal";
import { CategoryTreeItem } from "./CategoryTreeItem";
import { Tooltip } from "./Tooltip";

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
      <div className="flex mt-2.5 items-center">
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="flex items-center w-full px-4 py-1.5 text-sm gap-2 hover:bg-gray-200"
        >
          <PiPlus className="text-base" />
          {t("addNewCategory")}
        </button>
        <Tooltip
          variant="coach"
          disableHoverableContent={false}
          delayDuration={0}
          sideOffset={3}
          side="bottom"
          content={
            <section className="w-72 p-2">
              <h3 className="font-semibold text-xs mb-2">
                {t("whatIsCategory")}
              </h3>
              <p>
                {t.rich("categoryDescription", {
                  reportsLink: (chunk) => (
                    <Link
                      className="text-green-500 underline"
                      href="/app/reports"
                    >
                      {chunk}
                    </Link>
                  ),
                })}
              </p>
            </section>
          }
        >
          <span className="py-1.5 px-4 text-gray-600 hover:bg-gray-200">
            <PiQuestion className="text-lg" />
          </span>
        </Tooltip>
      </div>
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
