import type { Folder, Task, TimeEntry } from "@minute/schemas";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PiArrowCounterClockwiseFill } from "react-icons/pi";
import { tv } from "tailwind-variants";
import { Duration } from "../../../_components/Duration";
import { FolderBreadcrumb } from "../../../_components/FolderBreadcrumb";
import { TimeEntryModal } from "../../../_components/TimeEntryModal";
import { Tooltip } from "../../../_components/Tooltip";
import { trpc } from "../../../_components/TrpcProvider";
import { useToast } from "../../../_hooks/useToast";

const repeatButtonStyle = tv({
  base: "rounded-sm p-3 text-green-500 outline-hidden",
  variants: {
    isRunning: {
      false: "text-green-500 hover:bg-gray-200 focus:bg-gray-200",
      true: "text-gray-400 cursor-not-allowed",
    },
  },
});

type Props = {
  isRunning: boolean;
  timeEntry: TimeEntry & { task: Task & { folder: Folder } };
};

export const TimeEntryListItem = ({ timeEntry, isRunning }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { notify } = useToast();

  const utils = trpc.useUtils();
  const t = useTranslations("components.TimeEntryListItem");

  const startRunningTimeEntry =
    trpc.runningTimeEntry.startRunningTimeEntry.useMutation({
      onSuccess: async () => {
        notify(t("timerStarted"));
        await utils.runningTimeEntry.getRunningTimeEntry.invalidate();
      },
    });

  const onClickRepeatButton = async ({
    folderId,
    description,
  }: {
    folderId: string;
    description: string;
  }) => {
    await startRunningTimeEntry.mutateAsync({
      folderId: folderId,
      description: description,
      startedAt: new Date(),
    });
  };

  return (
    <li key={timeEntry.id} className="flex p-1">
      <button
        type="button"
        className="flex flex-1 items-baseline rounded-sm p-3 outline-hidden hover:bg-gray-200 focus:bg-gray-200"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <span className="flex flex-1 items-baseline">
          <span className="mr-4">{timeEntry.task.description}</span>
          <FolderBreadcrumb folderId={timeEntry.task.folderId} />
        </span>
        <span className="text-sm text-gray-500 font-mono">
          {format(timeEntry.startedAt, "HH:mm:ss")}一
          {format(timeEntry.stoppedAt, "HH:mm:ss")}
        </span>
        ・
        <Duration
          startedAt={timeEntry.startedAt}
          stoppedAt={timeEntry.stoppedAt}
        />
      </button>
      <Tooltip side="top" content={t("startSameTask")}>
        <button
          type="button"
          aria-label={t("startSameTask")}
          className={repeatButtonStyle({ isRunning })}
          disabled={isRunning}
          onClick={() =>
            void onClickRepeatButton({
              folderId: timeEntry.task.folderId,
              description: timeEntry.task.description,
            })
          }
        >
          <PiArrowCounterClockwiseFill size={22} />
        </button>
      </Tooltip>
      {isModalOpen && (
        <TimeEntryModal
          id={timeEntry.id}
          folderId={timeEntry.task.folder.id}
          description={timeEntry.task.description}
          startedAt={timeEntry.startedAt}
          stoppedAt={timeEntry.stoppedAt}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}
    </li>
  );
};
