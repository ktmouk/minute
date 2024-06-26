"use client";

import { endOfWeek, startOfWeek } from "date-fns";
import { useToday } from "../../../_hooks/useToday";
import { CalendarContent } from "./CalendarContent";
import { CalendarHeader } from "./CalendarHeader";

export type Props = {
  date: Date | undefined;
  isHighlighted: boolean;
};

export const Calendar = ({ date, isHighlighted }: Props) => {
  const today = useToday();

  return (
    <div className="flex-1 h-full min-h-screen flex-col flex p-6 max-w-5xl">
      <div className="mb-6">
        {today !== undefined ? (
          <CalendarHeader today={today} date={date ?? today} />
        ) : (
          <div className="h-10 animate-pulse bg-gray-300 w-48 rounded" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex h-full relative justify-between border border-gray-300 rounded">
          {today !== undefined && (
            <CalendarContent
              today={today}
              highlightedDate={isHighlighted ? date : undefined}
              startDate={startOfWeek(date ?? today)}
              endDate={endOfWeek(date ?? today)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
