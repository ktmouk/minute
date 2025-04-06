import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { useMemo, useReducer, useState } from "react";
import {
  PiDotsThreeBold,
  PiFolder,
  PiNotePencil,
  PiSquaresFourLight,
  PiTrash,
} from "react-icons/pi";
import { TreeItemArrowIcon } from "../_components/TreeItemArrowIcon";
import { useToast } from "../_hooks/useToast";
import { CategoryModal } from "./CategoryModal";
import { Tooltip } from "./Tooltip";
import { TreePath } from "./TreePath";
import { trpc } from "./TrpcProvider";

type Props = {
  id: string;
  emoji: string;
  color: string;
  name: string;
  folderIds: string[];
};

export const CategoryTreeItem = ({
  id,
  emoji,
  color,
  name,
  folderIds,
}: Props) => {
  const utils = trpc.useUtils();
  const { notify } = useToast();

  const t = useTranslations("components.CategoryTreeItem");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allFolders = trpc.folders.getAllFolders.useQuery();

  const deleteCategory = trpc.categories.deleteCategory.useMutation({
    onSuccess: async () => {
      notify(t("categoryDeleted"));
      await utils.categories.invalidate();
    },
  });

  const folders = useMemo(() => {
    return folderIds.map((folderId) =>
      allFolders.data?.find(({ id }) => folderId === id),
    );
  }, [folderIds, allFolders]);

  const [isOpen, toggleIsOpen] = useReducer(
    (isOpen: boolean) => !isOpen,
    false,
  );

  const handleDeleteButtonClick = async () => {
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }
    await deleteCategory.mutateAsync({ id });
  };

  return (
    <li>
      <div className="group hover:bg-gray-200">
        <div className="flex flex-1 justify-between">
          <button
            type="button"
            className="block cursor-pointer w-full px-4 text-sm"
            onClick={toggleIsOpen}
          >
            <TreePath depth={0}>
              <span title={name} className="flex w-full min-w-0 items-center">
                <TreeItemArrowIcon isOpen={isOpen} />
                <span style={{ color }} className="mr-2">
                  <PiSquaresFourLight size={20} />
                </span>
                <span className="mr-1.5 shrink-0 text-base">{emoji}</span>
                <span className="truncate">{name}</span>
              </span>
            </TreePath>
          </button>
          <div className="relative">
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
                    className="px-3 cursor-pointer py-2 w-full flex items-center gap-1 data-active:bg-gray-200"
                    onClick={() => {
                      setIsModalOpen(true);
                    }}
                  >
                    <PiNotePencil className="text-lg" />
                    {t("editCategory")}
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
                    {t("deleteCategory")}
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <CategoryModal
          id={id}
          name={name}
          folderIds={folderIds}
          emoji={emoji}
          color={color}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}
      {isOpen && (
        <ul>
          {folders.map((folder) => {
            if (folder === undefined) return undefined;
            return (
              <li
                key={folder.id}
                className="flex items-center justify-between w-full pl-4 text-sm group"
              >
                <TreePath depth={1}>
                  <span
                    title={folder.name}
                    className="flex py-1 w-full min-w-0 items-center"
                  >
                    <span style={{ color: folder.color }} className="mr-2 ml-4">
                      <PiFolder size={20} />
                    </span>
                    <span className="mr-1.5 shrink-0 text-base">
                      {folder.emoji}
                    </span>
                    <span className="truncate">{folder.name}</span>
                  </span>
                </TreePath>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};
