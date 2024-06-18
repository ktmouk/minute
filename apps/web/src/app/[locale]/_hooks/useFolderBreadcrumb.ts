import type { Folder } from "@minute/schemas";
import { useMemo } from "react";
import { trpc } from "../_components/TrpcProvider";

const getAncestorIds = (
  allFolders: Folder[],
  ancestorIds: [string, ...string[]],
): string[] => {
  const id = allFolders.find(({ id }) => id === ancestorIds[0])?.parentId;

  return typeof id === "string"
    ? getAncestorIds(allFolders, [id, ...ancestorIds])
    : ancestorIds;
};

export const useFolderBreadcrumb = ({ folderId }: { folderId: string }) => {
  const allFolders = trpc.folders.getAllFolders.useQuery();

  return useMemo(() => {
    return getAncestorIds(allFolders.data ?? [], [folderId]).map((id) =>
      allFolders.data?.find((folder) => folder.id === id),
    );
  }, [folderId, allFolders]);
};
