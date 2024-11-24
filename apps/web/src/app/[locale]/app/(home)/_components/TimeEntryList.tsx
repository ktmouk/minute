import type { Folder, Task, TimeEntry } from "@minute/schemas";
import {
  differenceInDays,
  format,
  formatISO,
  getDay,
  startOfDay,
} from "date-fns";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { PiCalendarBlank, PiTimer } from "react-icons/pi";
import * as R from "remeda";
import { tv } from "tailwind-variants";
import { useRouter } from "../../../../../i18n/routing";
import { TimeEntryModal } from "../../../_components/TimeEntryModal";
import { Tooltip } from "../../../_components/Tooltip";
import { trpc } from "../../../_components/TrpcProvider";
import { TimeEntryListItem } from "./TimeEntryListItem";
import { TimeEntrySummary } from "./TimeEntrySummary";

type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const weekdayStyle = tv({
  variants: {
    weekday: {
      0: "text-red-500",
      1: "text-green-500",
      2: "text-green-500",
      3: "text-green-500",
      4: "text-green-500",
      5: "text-green-500",
      6: "text-blue-500",
    },
  },
});

type Props = {
  date: Date;
  timeEntries: (TimeEntry & { task: Task & { folder: Folder } })[];
};

const capitalize = (text: string) => {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
};

export const TimeEntryList = ({ date, timeEntries }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const locale = useLocale();

  const t = useTranslations("components.TimeEntryList");
  const formatDate = useFormatter();
  const router = useRouter();

  const runningTimeEntry = trpc.runningTimeEntry.getRunningTimeEntry.useQuery();
  const allFolders = trpc.folders.getAllFolders.useQuery();
  const isRunning = !R.isNullish(runningTimeEntry.data);

  const title = useMemo(() => {
    return capitalize(
      new Intl.RelativeTimeFormat(locale, {
        numeric: "auto",
      }).format(
        differenceInDays(startOfDay(date), startOfDay(new Date())),
        "day",
      ),
    );
  }, [date, locale]);

  return (
    <div>
      <header className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="mr-2">{title}</h2>
          <time
            dateTime={formatISO(date)}
            className="mr-2 text-sm text-gray-500"
          >
            {formatDate.dateTime(date, "long")}{" "}
            <span
              className={weekdayStyle({ weekday: getDay(date) as Weekday })}
            >
              {formatDate.dateTime(date, "week")}
            </span>
          </time>
          <Tooltip side="top" content={t("viewInCalendar")}>
            <button
              type="button"
              aria-label={t("viewInCalendar")}
              onClick={() => {
                router.push(
                  `/app/calendar?date=${format(date, "yyyy-MM-dd")}&isHighlighted=true`,
                );
              }}
              className="mb-0.5 rounded p-1 text-sm text-green-500 outline-none hover:bg-gray-200 focus:bg-gray-200"
            >
              <PiCalendarBlank size={22} />
            </button>
          </Tooltip>
        </div>
        <div className="flex items-center text-sm">
          <div className="mx-2">
            <TimeEntrySummary date={date} />
          </div>
          {allFolders.data?.[0] && (
            <div className="border-l ml-2 pl-2 border-gray-300">
              <Tooltip side="top" content={t("addManually")}>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded px-2 py-1.5 text-sm text-green-500 outline-none hover:bg-gray-200 focus:bg-gray-200"
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                >
                  <PiTimer size={22} className="inline-block" />
                  <span className="mt-0.5">{t("new")}</span>
                </button>
              </Tooltip>
              {isModalOpen && (
                <TimeEntryModal
                  folderId={allFolders.data[0].id}
                  description=""
                  startedAt={date}
                  stoppedAt={date}
                  onClose={() => {
                    setIsModalOpen(false);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </header>
      <ul className="mt-2 divide-y divide-gray-200 rounded border border-gray-300 bg-white text-sm">
        {timeEntries.map((timeEntry) => (
          <TimeEntryListItem
            key={timeEntry.id}
            timeEntry={timeEntry}
            isRunning={isRunning}
          />
        ))}
      </ul>
    </div>
  );
};
