import type { Folder } from "@minute/schemas";
import { useMemo } from "react";
import { trpc } from "../_components/TrpcProvider";

export type FolderTree = {
  folder: Folder;
  childTree: FolderTree[];
};

const createFolderTree = ({
  parentId,
  allFolders,
}: {
  parentId: string | null;
  allFolders: Folder[];
}): FolderTree[] => {
  const folders = allFolders
    .filter((folder) => parentId === folder.parentId)
    .sort((a, b) => a.order - b.order);

  return folders.map((folder) => {
    return {
      folder,
      childTree: createFolderTree({
        parentId: folder.id,
        allFolders,
      }),
    };
  });
};

export const useFolderTree = () => {
  const allFolders = trpc.folders.getAllFolders.useQuery();

  return useMemo(() => {
    return createFolderTree({
      parentId: null,
      allFolders: allFolders.data ?? [],
    });
  }, [allFolders]);
};
