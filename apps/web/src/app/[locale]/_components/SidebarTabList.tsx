import { Tab, TabList } from "@headlessui/react";
import { useTranslations } from "next-intl";

const tabs = {
  folders: {
    text: "folders",
  },
  categories: {
    text: "categories",
  },
} as const;

export const SidebarTabList = () => {
  const t = useTranslations("components.SidebarTab");

  return (
    <div className="px-3.5 text-sm">
      <TabList className="-mb-px flex list-none items-end">
        {Object.entries(tabs).map(([key, { text }]) => {
          return (
            <Tab
              key={key}
              className="group flex flex-col px-0.5 outline-hidden after:h-1 after:w-full after:rounded-xs after:bg-transparent hover:after:bg-gray-500 focus:after:rounded-none ui-selected:after:bg-gray-600"
            >
              <span className="flex h-full rounded-sm p-2 group-focus:bg-gray-200">
                {t(text)}
              </span>
            </Tab>
          );
        })}
      </TabList>
    </div>
  );
};
