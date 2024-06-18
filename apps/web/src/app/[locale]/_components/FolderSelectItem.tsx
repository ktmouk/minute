import { ListboxOption } from "@headlessui/react";
import { PiCheckBold, PiFolder } from "react-icons/pi";
import { TreePath } from "../_components/TreePath";
import type { FolderTree } from "../_hooks/useFolderTree";

type Props = {
  id: string;
  name: string;
  color: string;
  emoji: string;
  childTree: FolderTree[];
  depth: number;
  selectedFolderIds: string[];
};

export const FolderSelectItem = ({
  id,
  name,
  emoji,
  color,
  depth,
  childTree,
  selectedFolderIds,
}: Props) => {
  return (
    <li>
      <ListboxOption
        className="block cursor-pointer rounded w-full px-2 text-sm ui-active:bg-gray-200"
        value={id}
      >
        <TreePath depth={depth}>
          <span className="flex w-full py-1 min-w-0 items-center">
            <span style={{ color }}>
              <PiFolder size={20} className="mr-2" />
            </span>
            <span className="mr-1.5 shrink-0 text-base">{emoji}</span>
            <span className="truncate flex-1">{name}</span>
            {selectedFolderIds.includes(id) && <PiCheckBold className="ml-2" />}
          </span>
        </TreePath>
      </ListboxOption>
      <ul>
        {childTree.map(({ folder, childTree }) => (
          <FolderSelectItem
            key={folder.id}
            id={folder.id}
            color={folder.color}
            emoji={folder.emoji}
            name={folder.name}
            childTree={childTree}
            depth={depth + 1}
            selectedFolderIds={selectedFolderIds}
          />
        ))}
      </ul>
    </li>
  );
};
