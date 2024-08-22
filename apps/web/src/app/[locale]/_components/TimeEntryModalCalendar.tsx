import {
  endOfDay,
  getDay,
  getUnixTime,
  isAfter,
  min,
  startOfDay,
} from "date-fns";
import { useFormatter } from "next-intl";
import { useEffect, useRef } from "react";
import { tv } from "tailwind-variants";
import { useDebounceValue } from "usehooks-ts";
import { useEventElevations } from "../_hooks/useEventElevations";
import { CalendarEvent } from "./CalendarEvent";
import { CalendarPosition } from "./CalendarPosition";
import { CalendarRowLines } from "./CalendarRowLines";
import { trpc } from "./TrpcProvider";

type Props = {
  id: string | undefined;
  folderId: string;
  description: string;
  startedAt: Date;
  stoppedAt: Date;
};

type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const weekdayStyle = tv({
  base: "ml-1",
  variants: {
    weekday: {
      0: "text-red-500",
      1: "text-gray-600",
      2: "text-gray-600",
      3: "text-gray-600",
      4: "text-gray-600",
      5: "text-gray-600",
      6: "text-blue-500",
    },
  },
});

export const TimeEntryModalCalendar = ({
  id,
  folderId,
  description,
  startedAt,
  stoppedAt,
}: Props) => {
  const formatDate = useFormatter();
  const baseDate = startOfDay(startedAt);

  const allFolders = trpc.folders.getAllFolders.useQuery();
  const currentFolder = allFolders.data?.find(
    (folder) => folder.id === folderId,
  );

  const [debouncedStartedAt] = useDebounceValue(startedAt, 500);

  const timeEntries = trpc.timeEntries.getCalendarTimeEntries.useQuery({
    startDate: startOfDay(debouncedStartedAt),
    endDate: endOfDay(debouncedStartedAt),
  });

  const evelations = useEventElevations(
    (timeEntries.data ?? []).filter((timeEntry) => timeEntry.id !== id),
  );

  const scrollPositionRef = useRef<HTMLDivElement>(null);
  const unixStartedAt = getUnixTime(startedAt);

  useEffect(() => {
    scrollPositionRef.current?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [unixStartedAt]);

  return (
    <div className="w-full flex-col flex h-full">
      <header className="min-h-14 flex justify-center items-center px-4 border-l border-b border-gray-300">
        {formatDate.dateTime(baseDate, "short")}
        <span
          className={weekdayStyle({
            weekday: getDay(baseDate) as Weekday,
          })}
        >
          {formatDate.dateTime(baseDate, {
            weekday: "short",
          })}
        </span>
      </header>
      <div className="overflow-auto">
        <div className="relative flex border-l border-gray-300">
          <div className="flex flex-col text-xs h-full">
            <CalendarRowLines />
          </div>
          <div className="relative overflow-hidden flex-1">
            {currentFolder && !isAfter(startedAt, stoppedAt) && (
              <CalendarPosition
                startDate={startedAt}
                endDate={stoppedAt}
                baseDate={baseDate}
              >
                {(style) => {
                  return (
                    <div className="absolute z-20 min-h-[1.7rem]" style={style}>
                      <span ref={scrollPositionRef} className="absolute"></span>
                      <CalendarEvent
                        emoji={currentFolder.emoji}
                        title={description}
                        color={currentFolder.color}
                        startDate={startedAt}
                        endDate={min([stoppedAt, endOfDay(baseDate)])}
                      />
                    </div>
                  );
                }}
              </CalendarPosition>
            )}
            <div className="opacity-30">
              {evelations.map(({ event, elevation, maxElevation }) => (
                <CalendarPosition
                  key={event.id}
                  baseDate={baseDate}
                  startDate={event.startedAt}
                  endDate={event.stoppedAt}
                  elevation={elevation}
                  maxElevation={maxElevation}
                >
                  {(style) => (
                    <div className="absolute min-h-[1.7rem]" style={style}>
                      <CalendarEvent
                        emoji={event.task.folder.emoji}
                        title={event.task.description}
                        color={event.task.folder.color}
                        startDate={event.startedAt}
                        endDate={min([event.stoppedAt, endOfDay(baseDate)])}
                      />
                    </div>
                  )}
                </CalendarPosition>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
