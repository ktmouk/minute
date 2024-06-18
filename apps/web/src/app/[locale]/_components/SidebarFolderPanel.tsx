"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  MouseSensor,
  pointerWithin,
  useSensor,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { TabPanel } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PiPlus } from "react-icons/pi";
import { z } from "zod";
import { FolderTreeItem } from "../_components/FolderTreeItem";
import { trpc } from "../_components/TrpcProvider";
import { useFolderTree } from "../_hooks/useFolderTree";
import { useToast } from "../_hooks/useToast";
import { InlineFolderForm } from "./InlineFolderForm";

const overSchema = z.strictObject({
  id: z.string(),
  action: z.enum(["in", "before", "after"]),
  parentId: z.string().nullable(),
  order: z.number(),
});

const activeSchema = z.strictObject({
  id: z.string(),
  type: z.enum(["folder", "task"]),
});

export const SidebarFolderPanel = () => {
  const utils = trpc.useUtils();
  const t = useTranslations("components.SidebarFolderPanel");
  const folderTree = useFolderTree();
  const { notify } = useToast();

  const [isShowForm, setIsShowForm] = useState(false);
  const [invisibleId, setInvisibleId] = useState<string | undefined>(undefined);

  const moveTask = trpc.tasks.moveTask.useMutation({
    onMutate: ({ id }) => {
      setInvisibleId(id);
      return;
    },
    onSuccess: async () => {
      notify(t("taskMoved"));
      await utils.folders.getAllFolders.invalidate();
      await utils.timeEntries.invalidate();
      await utils.tasks.getTasksInFolder.invalidate();
    },
    onSettled: () => {
      setInvisibleId(undefined);
    },
  });

  const moveFolder = trpc.folders.moveFolder.useMutation({
    onMutate: ({ folderId }) => {
      setInvisibleId(folderId);
      return;
    },
    onSuccess: async () => {
      notify(t("folderMoved"));
      await utils.folders.getAllFolders.invalidate();
    },
    onSettled: () => {
      setInvisibleId(undefined);
    },
  });

  const createFolder = trpc.folders.createFolder.useMutation({
    onSuccess: async () => {
      notify(t("folderCreated"));
      await utils.folders.getAllFolders.invalidate();
    },
  });

  const handleFolderFormSubmit = async ({
    color,
    emoji,
    name,
  }: {
    color: string;
    emoji: string;
    name: string;
  }) => {
    await createFolder.mutateAsync({
      name,
      color,
      emoji,
    });
    setIsShowForm(false);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (over === null) return;

    const parsedActive = activeSchema.parse(active.data.current);
    const parsedOver = overSchema.parse(over.data.current);

    switch (parsedActive.type) {
      case "folder":
        switch (parsedOver.action) {
          case "in":
            await moveFolder.mutateAsync({
              ancestorId: parsedOver.id,
              afterFolderId: null,
              folderId: parsedActive.id,
            });
            return;
          case "before":
            await moveFolder.mutateAsync({
              ancestorId: parsedOver.parentId,
              afterFolderId: null,
              folderId: parsedActive.id,
            });
            return;
          case "after":
            await moveFolder.mutateAsync({
              ancestorId: parsedOver.parentId,
              afterFolderId: parsedOver.id,
              folderId: parsedActive.id,
            });
            return;
        }
      case "task":
        switch (parsedOver.action) {
          case "in":
            await moveTask.mutateAsync({
              id: parsedActive.id,
              folderId: parsedOver.id,
            });
            return;
        }
    }
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  return (
    <TabPanel>
      <ul>
        <DndContext
          sensors={[mouseSensor]}
          modifiers={[restrictToVerticalAxis]}
          collisionDetection={pointerWithin}
          onDragEnd={(event) => void handleDragEnd(event)}
        >
          {folderTree.map(({ folder, childTree }, index) => (
            <FolderTreeItem
              key={folder.id}
              id={folder.id}
              color={folder.color}
              emoji={folder.emoji}
              name={folder.name}
              childTree={childTree}
              parentId={folder.parentId}
              order={folder.order}
              depth={0}
              now={new Date()}
              isFirst={index === 0}
              invisibleId={invisibleId}
            />
          ))}
        </DndContext>
      </ul>
      {!isShowForm ? (
        <button
          type="button"
          onClick={() => {
            setIsShowForm(true);
          }}
          className="flex items-center w-full my-2.5 px-4 py-1.5 text-sm gap-2 hover:bg-gray-200"
        >
          <PiPlus className="text-base" />
          {t("addNewFolder")}
        </button>
      ) : (
        <div className="mt-2">
          <InlineFolderForm
            onSubmit={(value) => void handleFolderFormSubmit(value)}
            onCancel={() => {
              setIsShowForm(false);
            }}
          />
        </div>
      )}
    </TabPanel>
  );
};
