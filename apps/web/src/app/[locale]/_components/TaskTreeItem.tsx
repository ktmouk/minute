import { useDraggable } from "@dnd-kit/core";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PiDotsThreeBold, PiFile, PiNotePencil, PiTrash } from "react-icons/pi";
import { tv } from "tailwind-variants";
import { TreeItemArrowIcon } from "../_components/TreeItemArrowIcon";
import { trpc } from "../_components/TrpcProvider";
import { useToast } from "../_hooks/useToast";
import { InlineTaskForm } from "./InlineTaskForm";
import { TimeEntryTreeItem } from "./TimeEntryTreeItem";
import { Tooltip } from "./Tooltip";
import { TreePath } from "./TreePath";

type Props = {
  id: string;
  description: string;
  depth: number;
  now: Date;
  color: string;
  invisibleId: string | undefined;
};

const listStyle = tv({
  variants: {
    isVisible: {
      false: "invisible",
    },
    isDragging: {
      true: "opacity-20",
    },
  },
});

export const TaskTreeItem = ({
  id,
  color,
  depth,
  description,
  now,
  invisibleId,
}: Props) => {
  const utils = trpc.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("components.TaskTreeItem");
  const { notify } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const timeEntries = trpc.timeEntries.getTimeEntriesInTasks.useQuery(
    { taskId: id },
    { enabled: isOpen },
  );

  const { setNodeRef, isDragging, listeners, attributes, transform } =
    useDraggable({
      id,
      data: {
        id,
        type: "task",
      },
    });

  const updateTask = trpc.tasks.updateTask.useMutation({
    onSuccess: async () => {
      notify(t("taskUpdated"));
      await utils.tasks.getTasksInFolder.invalidate();
      await utils.timeEntries.invalidate();
    },
  });

  const deleteTask = trpc.tasks.deleteTask.useMutation({
    onSuccess: async () => {
      notify(t("taskDeleted"));
      await utils.tasks.getTasksInFolder.invalidate();
      await utils.timeEntries.invalidate();
    },
  });

  const handleEdit = async ({ description }: { description: string }) => {
    await updateTask.mutateAsync({ id, description });
    setIsEditing(false);
  };

  const handleEditButtonClick = () => {
    setIsEditing(true);
  };

  const handleDeleteButtonClick = async () => {
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }
    await deleteTask.mutateAsync({ id });
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  if (isEditing) {
    return (
      <li>
        <InlineTaskForm
          description={description}
          color={color}
          onCancel={() => {
            setIsEditing(false);
          }}
          onSubmit={(value) => {
            void handleEdit(value);
          }}
        />
      </li>
    );
  }

  const transformStyle = transform
    ? `translate(${transform.x}px, ${transform.y}px)`
    : undefined;

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={listStyle({ isVisible: invisibleId !== id, isDragging })}
      style={{ transform: transformStyle }}
    >
      <div className="group flex hover:bg-gray-200">
        <button
          type="button"
          className="block w-full px-4 text-sm"
          onClick={handleClick}
        >
          <TreePath depth={depth}>
            <span
              title={description}
              className="flex w-full min-w-0 items-center"
            >
              <TreeItemArrowIcon isOpen={isOpen} />
              <span style={{ color }} className="mr-1 shrink-0">
                <PiFile size={20} />
              </span>
              <span className="truncate">{description}</span>
            </span>
          </TreePath>
        </button>
        {!isDragging && (
          <div className="relative">
            <Menu>
              <Tooltip sideOffset={3} side="top" content={t("openMenu")}>
                <MenuButton className="px-3 focus:bg-gray-200 h-full text-xl opacity-0 group-focus:opacity-100 focus:opacity-100 group-hover:opacity-100 data-[open]:opacity-100">
                  <PiDotsThreeBold />
                </MenuButton>
              </Tooltip>
              <MenuItems
                anchor="bottom start"
                className="bg-white z-10 drop-shadow-sm border border-gray-300 text-sm rounded overflow-hidden"
              >
                <MenuItem>
                  <button
                    type="button"
                    className="px-3 py-2 flex w-full items-center gap-1 data-[active]:bg-gray-200"
                    onClick={() => {
                      handleEditButtonClick();
                    }}
                  >
                    <PiNotePencil className="text-lg" />
                    {t("editTask")}
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    type="button"
                    className="px-3 py-2 text-red-500 flex items-center gap-1 data-[active]:bg-gray-200"
                    onClick={() => {
                      void handleDeleteButtonClick();
                    }}
                  >
                    <PiTrash className="text-lg" />
                    {t("deleteTask")}
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        )}
      </div>
      {isOpen && (
        <ul>
          {(timeEntries.data ?? []).map((timeEntry) => (
            <TimeEntryTreeItem
              key={timeEntry.id}
              depth={depth + 1}
              startedAt={timeEntry.startedAt}
              stoppedAt={timeEntry.stoppedAt}
              now={now}
              color={color}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
