import { Listbox, ListboxButton, ListboxOptions } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { FolderBreadcrumb } from "../../../_components/FolderBreadcrumb";
import { FolderSelectItem } from "../../../_components/FolderSelectItem";
import { useFolderTree } from "../../../_hooks/useFolderTree";

type Props = {
  folderId: string;
  onSelect: (folderId: string) => void;
};

export const FolderSelect = ({ folderId, onSelect }: Props) => {
  const t = useTranslations("components.FolderSelect");
  const folderTree = useFolderTree();

  return (
    <Listbox value={folderId} onChange={onSelect}>
      <div className="relative w-full">
        <ListboxButton className="inline-flex w-full rounded px-2 py-1 outline-none hover:bg-gray-200 focus:bg-gray-200">
          <FolderBreadcrumb
            folderId={folderId}
            fallback={<p className="text-gray-500 py-0.5">{t("noFolder")}</p>}
          />
        </ListboxButton>
        <ListboxOptions className="absolute z-10 cursor-pointer w-full outline-none mt-1 animate-fade-down">
          <div className="w-72 rounded border border-gray-300 bg-white text-sm drop-shadow-sm">
            <h3 className="border-b border-gray-300 px-4 py-2">
              {t("selectFolder")}
            </h3>
            <ul className="m-2">
              {folderTree.map(({ folder, childTree }) => (
                <FolderSelectItem
                  key={folder.id}
                  id={folder.id}
                  color={folder.color}
                  emoji={folder.emoji}
                  name={folder.name}
                  childTree={childTree}
                  depth={0}
                  selectedFolderIds={[folderId]}
                />
              ))}
            </ul>
          </div>
        </ListboxOptions>
      </div>
    </Listbox>
  );
};
