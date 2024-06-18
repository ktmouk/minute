import { Listbox, ListboxButton, ListboxOptions } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { FolderBreadcrumb } from "../_components/FolderBreadcrumb";
import { useFolderTree } from "../_hooks/useFolderTree";
import { FolderSelectItem } from "./FolderSelectItem";

type Props = {
  folderIds: string[];
  onSelect: (folderIds: string[]) => void;
};

export const MultipleFolderSelect = ({ folderIds, onSelect }: Props) => {
  const t = useTranslations("components.MultipleFolderSelect");
  const folderTree = useFolderTree();

  return (
    <Listbox value={folderIds} onChange={onSelect} multiple>
      <div className="relative w-full">
        <ListboxButton className="inline-flex flex-wrap w-full rounded gap-1 outline-none p-1 hover:bg-gray-200">
          {folderIds.length > 0 ? (
            folderIds.map((folderId) => (
              <span
                key={folderId}
                className="bg-gray-500 rounded-full px-2 text-white"
              >
                <FolderBreadcrumb folderId={folderId} caretColor="white" />
              </span>
            ))
          ) : (
            <p className="p-0.5 px-2 text-gray-500">{t("selectFolder")}</p>
          )}
        </ListboxButton>
        <ListboxOptions className="absolute w-full outline-none z-10 mt-1 animate-fade-down">
          <div className="w-72 rounded border border-gray-300 bg-white text-sm drop-shadow-sm">
            <h3 className="border-b border-gray-300 px-4 py-2">
              {t("selectFolder")}
            </h3>
            <ul className="m-2 ">
              {folderTree.map(({ folder, childTree }) => (
                <FolderSelectItem
                  key={folder.id}
                  id={folder.id}
                  color={folder.color}
                  emoji={folder.emoji}
                  name={folder.name}
                  childTree={childTree}
                  depth={0}
                  selectedFolderIds={folderIds}
                />
              ))}
            </ul>
          </div>
        </ListboxOptions>
      </div>
    </Listbox>
  );
};
