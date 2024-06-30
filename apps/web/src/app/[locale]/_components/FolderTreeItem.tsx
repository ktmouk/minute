import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { useReducer, useState } from "react";
import {
  PiDotsThreeBold,
  PiFolder,
  PiNotePencil,
  PiTrash,
} from "react-icons/pi";
import { tv } from "tailwind-variants";
import { TreeItemArrowIcon } from "../_components/TreeItemArrowIcon";
import { trpc } from "../_components/TrpcProvider";
import type { FolderTree } from "../_hooks/useFolderTree";
import { useToast } from "../_hooks/useToast";
import { FolderTreeItemDropLine } from "./FolderTreeItemDropLine";
import { InlineFolderForm } from "./InlineFolderForm";
import { TaskTreeItem } from "./TaskTreeItem";
import { Tooltip } from "./Tooltip";
import { TreePath } from "./TreePath";

type Props = {
  id: string;
  emoji: string;
  color: string;
  name: string;
  depth: number;
  parentId: string | null;
  order: number;
  childTree: FolderTree[];
  now: Date;
  isFirst: boolean;
  invisibleId: string | undefined;
  isAncestorDragging?: boolean;
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

const itemStyle = tv({
  variants: {
    isOver: {
      true: "bg-gray-200",
    },
  },
});

export const FolderTreeItem = ({
  id,
  emoji,
  color,
  name,
  depth,
  childTree,
  now,
  isFirst,
  parentId,
  order,
  invisibleId,
  isAncestorDragging = false,
}: Props) => {
  const utils = trpc.useUtils();
  const t = useTranslations("components.FolderTreeItem");
  const { notify } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, toggleIsOpen] = useReducer(
    (isOpen: boolean) => !isOpen,
    false,
  );

  const updateFolder = trpc.folders.updateFolder.useMutation({
    onSuccess: async () => {
      notify(t("folderUpdated"));
      await utils.folders.invalidate();
      await utils.timeEntries.invalidate();
    },
  });

  const deleteFolder = trpc.folders.deleteFolder.useMutation({
    onSuccess: async () => {
      notify(t("folderDeleted"));
      await utils.folders.invalidate();
      await utils.timeEntries.invalidate();
    },
  });

  const tasks = trpc.tasks.getTasksInFolder.useQuery(
    { folderId: id },
    { enabled: isOpen },
  );

  const handleEdit = async (value: {
    emoji: string;
    name: string;
    color: string;
  }) => {
    await updateFolder.mutateAsync({
      id,
      emoji: value.emoji,
      name: value.name,
      color: value.color,
    });
    setIsEditing(false);
  };

  const handleEditButtonClick = () => {
    setIsEditing(true);
  };

  const handleDeleteButtonClick = async () => {
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }
    await deleteFolder.mutateAsync({ id });
  };

  const {
    setNodeRef: setDraggableNodeRef,
    isDragging,
    listeners,
    attributes,
    transform,
  } = useDraggable({
    id,
    data: {
      id,
      type: "folder",
    },
  });

  const { setNodeRef, isOver } = useDroppable({
    id: `in:${id}`,
    disabled: isDragging || isAncestorDragging,
    data: { action: "in", id, parentId, order },
  });

  const transformStyle = transform
    ? `translate(${transform.x.toString()}px, ${transform.y.toString()}px)`
    : undefined;

  if (isEditing) {
    return (
      <li>
        <InlineFolderForm
          onSubmit={(value) => void handleEdit(value)}
          onCancel={() => {
            setIsEditing(false);
          }}
          defaultName={name}
          defaultColor={color}
          defaultEmoji={emoji}
        />
      </li>
    );
  }

  return (
    <li
      ref={setDraggableNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: transformStyle }}
      className={listStyle({ isVisible: invisibleId !== id, isDragging })}
    >
      <div className={itemStyle({ isOver: isOver })}>
        {isFirst && (
          <FolderTreeItemDropLine
            disabled={isDragging || isAncestorDragging}
            action="before"
            order={order}
            parentId={parentId}
            id={id}
          />
        )}
        <div className="group hover:bg-gray-200">
          <div className="flex flex-1 justify-between" ref={setNodeRef}>
            <button
              type="button"
              className="block flex-1 min-w-0 px-4 text-sm"
              onClick={toggleIsOpen}
            >
              <TreePath depth={depth}>
                <span title={name} className="flex min-w-0 items-center">
                  <TreeItemArrowIcon isOpen={isOpen} />
                  <span style={{ color }} className="mr-2">
                    <PiFolder size={20} />
                  </span>
                  <span className="mr-1.5 shrink-0 text-base">{emoji}</span>
                  <span className="truncate">{name}</span>
                </span>
              </TreePath>
            </button>
            {!isDragging && !isOver && (
              <div className="relative">
                <Menu>
                  <Tooltip sideOffset={3} side="top" content={t("openMenu")}>
                    <MenuButton className="px-1.5 focus:bg-gray-200 hover:bg-gray-300 h-full text-xl opacity-0 group-focus:opacity-100 focus:opacity-100 group-hover:opacity-100 data-[open]:opacity-100">
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
                        {t("editFolder")}
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
                        {t("deleteFolder")}
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <ul>
          {childTree.map(({ folder, childTree: grandChildTree }, index) => (
            <FolderTreeItem
              key={folder.id}
              color={folder.color}
              id={folder.id}
              emoji={folder.emoji}
              name={folder.name}
              childTree={grandChildTree}
              depth={depth + 1}
              now={now}
              isFirst={index === 0}
              order={folder.order}
              parentId={folder.parentId}
              invisibleId={invisibleId}
              isAncestorDragging={isDragging || isAncestorDragging}
            />
          ))}
          {(tasks.data ?? []).map((task) => (
            <TaskTreeItem
              key={task.id}
              id={task.id}
              folderId={id}
              description={task.description}
              depth={depth + 1}
              now={now}
              color={color}
              invisibleId={invisibleId}
            />
          ))}
        </ul>
      )}
      <FolderTreeItemDropLine
        disabled={isDragging || isAncestorDragging}
        action="after"
        order={order}
        parentId={parentId}
        id={id}
      />
    </li>
  );
};
