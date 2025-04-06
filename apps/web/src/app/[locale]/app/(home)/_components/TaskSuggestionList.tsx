import type { Task } from "@minute/schemas";
import type { UseComboboxPropGetters } from "downshift";
import { useTranslations } from "next-intl";
import { tv } from "tailwind-variants";
import { FolderBreadcrumb } from "../../../_components/FolderBreadcrumb";

const itemStyle = tv({
  base: "group inline-flex w-full items-center p-4 py-2.5 hover:cursor-pointer ui-active:bg-gray-200",
  variants: {
    highlighted: {
      true: "bg-gray-200",
    },
  },
});

type Props = {
  tasks: Task[];
  highlightedIndex: number;
  getItemProps: UseComboboxPropGetters<Task>["getItemProps"];
};

export const TaskSuggestionList = ({
  tasks,
  highlightedIndex,
  getItemProps,
}: Props) => {
  const t = useTranslations("components.TaskSuggestionList");

  return (
    <section className="w-full rounded-sm border border-gray-300 bg-white p-0 text-sm drop-shadow-sm">
      <h3 className="border-b border-gray-300 px-4 py-2">
        {t("recentEntries")}
      </h3>
      <ul className="max-h-96 divide-y divide-gray-200 overflow-y-auto">
        {tasks.map((task, index) => {
          const highlighted = highlightedIndex === index;
          const { key, ...props } = getItemProps({
            item: task,
            key: task.id,
            index,
          });
          return (
            <li key={key} {...props} className={itemStyle({ highlighted })}>
              <span className="mr-4">{task.description}</span>
              <span className="inline-flex gap-1">
                <FolderBreadcrumb folderId={task.folderId} />
              </span>
              {highlighted && (
                <span className="text-gray-400 ml-2">{t("startThis")}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
