"use client";

import type { Task } from "@minute/schemas";
import { useCombobox } from "downshift";
import type { UseComboboxStateChange } from "downshift";
import { useSetAtom } from "jotai";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { PiPlayFill, PiStopFill } from "react-icons/pi";
import * as R from "remeda";
import { tv } from "tailwind-variants";
import { useDebounceCallback } from "usehooks-ts";
import { totalDurationVisibleAtom } from "../../../../store";
import { Duration } from "../../../_components/Duration";
import { Tooltip } from "../../../_components/Tooltip";
import { trpc } from "../../../_components/TrpcProvider";
import { useToast } from "../../../_hooks/useToast";
import { FolderSelect } from "./FolderSelect";
import { RunningTimeEntryDescription } from "./RunningTimeEntryDescription";
import { TaskSuggestionList } from "./TaskSuggestionList";

const submitButtonStyle = tv({
  base: "mr-4 flex size-11 cursor-pointer shrink-0 items-center justify-center rounded-[100%] bg-green-500 text-3xl text-white",
  variants: {
    isLoading: {
      true: "animate-pulse bg-gray-300",
    },
    isRunning: {
      true: "bg-red-400",
    },
  },
});

const durationStyle = tv({
  base: "mr-4 text-base",
  variants: {
    isRunning: {
      false: "text-gray-500",
    },
  },
});

export const RunningTimeEntryForm = () => {
  const utils = trpc.useUtils();
  const t = useTranslations("components.RunningTimeEntryForm");
  const setTotalDurationVisible = useSetAtom(totalDurationVisibleAtom);
  const { notify } = useToast();

  const allFolders = trpc.folders.getAllFolders.useQuery();
  const runningTimeEntry = trpc.runningTimeEntry.getRunningTimeEntry.useQuery(
    undefined,
    {
      refetchOnWindowFocus: true,
    },
  );

  const startRunningTimeEntry =
    trpc.runningTimeEntry.startRunningTimeEntry.useMutation({
      onSuccess: async () => {
        notify(t("timerStarted"));
        await utils.runningTimeEntry.invalidate();
      },
    });

  const updateRunningTimeEntry =
    trpc.runningTimeEntry.updateRunningTimeEntry.useMutation({
      onSuccess: async () => {
        await utils.runningTimeEntry.invalidate();
      },
    });

  const stopRunningTimeEntry =
    trpc.runningTimeEntry.stopRunningTimeEntry.useMutation({
      onSuccess: async () => {
        notify(t("timerStopped"));
        await utils.runningTimeEntry.invalidate();
        await utils.timeEntries.getTimeEntries.invalidate();
        await utils.timeEntrySummaries.getTimeEntrySummary.invalidate();
        await utils.totalTimeEntryDuration.getTotalTimeEntryDuration.invalidate();
        setTotalDurationVisible(true);
      },
    });

  const isRunning = R.isNonNullish(runningTimeEntry.data);

  const [suggestionTasks, setSuggestionTasks] = useState<Task[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<
    string | undefined
  >();
  const [prevRunningData, setPrevRunningData] = useState(runningTimeEntry.data);
  const [prevAllFoldersData, setPrevAllFoldersData] = useState(allFolders.data);

  const handleSelectedItemChange = async ({
    selectedItem,
  }: UseComboboxStateChange<Task>) => {
    if (R.isNullish(selectedItem)) return;

    await startRunningTimeEntry.mutateAsync({
      folderId: selectedItem.folderId,
      description: selectedItem.description,
      startedAt: new Date(),
    });
  };

  const handleInputChange = useCallback(
    async ({
      inputValue = "",
      isOpen = false,
    }: {
      inputValue?: string;
      isOpen?: boolean;
    }) => {
      if (isOpen) {
        setSuggestionTasks(
          await utils.tasks.getSuggestionTasks.fetch({
            description: inputValue,
          }),
        );
      }
    },
    [utils],
  );

  const debouncedHandleInputChange = useDebounceCallback(
    handleInputChange,
    500,
  );

  const {
    isOpen,
    inputValue,
    getInputProps,
    getItemProps,
    getMenuProps,
    setInputValue,
    highlightedIndex,
  } = useCombobox<Task>({
    items: suggestionTasks,
    itemToString: (task) => task?.description ?? "",
    onSelectedItemChange: (event) => void handleSelectedItemChange(event),
    onIsOpenChange: (event) => void handleInputChange(event),
    onInputValueChange: (event) => void debouncedHandleInputChange(event),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isRunning) {
      await stopRunningTimeEntry.mutateAsync({
        stoppedAt: new Date(),
      });
      if (selectedFolderId !== undefined) {
        await utils.tasks.getTasksInFolder.invalidate({
          folderId: selectedFolderId,
        });
      }
    } else {
      if (selectedFolderId !== undefined) {
        await startRunningTimeEntry.mutateAsync({
          folderId: selectedFolderId,
          description: inputValue,
          startedAt: new Date(),
        });
      }
    }
  };

  const handleDescriptionBlur = async () => {
    if (isRunning && inputValue !== "") {
      await updateRunningTimeEntry.mutateAsync({ description: inputValue });
    }
  };

  if (runningTimeEntry.data !== prevRunningData) {
    setPrevRunningData(runningTimeEntry.data);
    setInputValue(runningTimeEntry.data?.description ?? "");
    if (isRunning && R.isNonNullish(runningTimeEntry.data)) {
      setSelectedFolderId(runningTimeEntry.data.folderId);
    }
  }

  if (allFolders.data !== prevAllFoldersData) {
    setPrevAllFoldersData(allFolders.data);
    const hasSelectedFolder = allFolders.data?.find(
      ({ id }) => id === selectedFolderId,
    );
    if (!isRunning && !hasSelectedFolder) {
      setSelectedFolderId(allFolders.data?.[0]?.id);
    }
  }

  const handleFolderSelect = async (folderId: string) => {
    setSelectedFolderId(folderId);
    if (isRunning) {
      await updateRunningTimeEntry.mutateAsync({ folderId });
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <div className="w-full rounded-sm border border-gray-300 bg-white text-sm">
        <h2 className="sr-only">{t("timerIsNotRunning")}</h2>
        <div className="mx-4 flex items-center border-b border-gray-300 py-2">
          <div className="mr-2 shrink-0 border-r border-r-gray-300 px-2 pr-4">
            {t("addTo")}
          </div>
          {runningTimeEntry.isLoading ? (
            <div className="animate-pulse w-32 my-2 h-4 bg-gray-300 rounded-full" />
          ) : (
            <FolderSelect
              folderId={selectedFolderId ?? ""}
              onSelect={(folderId) => void handleFolderSelect(folderId)}
            />
          )}
        </div>
        <div className="flex items-center">
          <RunningTimeEntryDescription<Task>
            isLoading={runningTimeEntry.isLoading}
            inputProps={getInputProps({ onBlur: handleDescriptionBlur })}
          />
          <span className={durationStyle({ isRunning })}>
            <Duration startedAt={runningTimeEntry.data?.startedAt} />
          </span>
          <Tooltip
            side="bottom"
            content={t(isRunning ? "stopWorking" : "startWorking")}
            sideOffset={3}
          >
            <button
              type="submit"
              className={submitButtonStyle({
                isRunning,
                isLoading: runningTimeEntry.isLoading,
              })}
              disabled={runningTimeEntry.isLoading}
              aria-label={t(isRunning ? "stopWorking" : "startWorking")}
            >
              {runningTimeEntry.isLoading ? null : isRunning ? (
                <PiStopFill size={20} />
              ) : (
                <PiPlayFill size={20} />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
      <div {...getMenuProps()} className="relative">
        {isOpen && !isRunning && suggestionTasks.length > 0 && (
          <div className="absolute w-full top-0 mt-2 animate-fade-down">
            <TaskSuggestionList
              tasks={suggestionTasks}
              highlightedIndex={highlightedIndex}
              getItemProps={getItemProps}
            />
          </div>
        )}
      </div>
    </form>
  );
};
