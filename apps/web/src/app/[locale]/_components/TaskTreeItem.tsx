import { useDraggable } from "@dnd-kit/core";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  PiDotsThreeBold,
  PiFile,
  PiNotePencil,
  PiPlayBold,
  PiTrash,
} from "react-icons/pi";
import * as R from "remeda";
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
  folderId: string;
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

const startButtonStyle = tv({
  base: "text-green-500 px-2.5 cursor-pointer focus:bg-gray-200 hover:bg-gray-300 opacity-0",
  variants: {
    isRunning: {
      false:
        "group-focus:opacity-100 focus:opacity-100 group-hover:opacity-100 data-open:opacity-100",
    },
  },
});

export const TaskTreeItem = ({
  id,
  color,
  depth,
  folderId,
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

  const runningTimeEntry = trpc.runningTimeEntry.getRunningTimeEntry.useQuery();
  const isRunning = !R.isNullish(runningTimeEntry.data);

  const startRunningTimeEntry =
    trpc.runningTimeEntry.startRunningTimeEntry.useMutation({
      onSuccess: async () => {
        notify(t("timerStarted"));
        await utils.runningTimeEntry.getRunningTimeEntry.invalidate();
      },
    });

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
    ? `translate(${transform.x.toString()}px, ${transform.y.toString()}px)`
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
          className="block cursor-pointer w-full min-w-0 px-4 text-sm"
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
          <div className="flex relative">
            <Tooltip sideOffset={3} side="top" content={t("startThisTask")}>
              <button
                type="button"
                disabled={isRunning}
                className={startButtonStyle({ isRunning })}
                onClick={() =>
                  void startRunningTimeEntry.mutateAsync({
                    folderId,
                    description,
                    startedAt: new Date(),
                  })
                }
              >
                <PiPlayBold size={14} />
              </button>
            </Tooltip>

            <Menu>
              <Tooltip sideOffset={3} side="top" content={t("openMenu")}>
                <MenuButton className="px-1.5 focus:bg-gray-200 hover:bg-gray-300 h-full text-xl opacity-0 group-focus:opacity-100 focus:opacity-100 group-hover:opacity-100 data-open:opacity-100">
                  <PiDotsThreeBold />
                </MenuButton>
              </Tooltip>
              <MenuItems
                anchor="bottom start"
                className="bg-white drop-shadow-sm border border-gray-300 text-sm rounded-sm overflow-hidden"
              >
                <MenuItem>
                  <button
                    type="button"
                    className="px-3 cursor-pointer py-2 flex w-full items-center gap-1 data-active:bg-gray-200"
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
                    className="px-3 cursor-pointer py-2 text-red-500 flex items-center gap-1 data-active:bg-gray-200"
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
