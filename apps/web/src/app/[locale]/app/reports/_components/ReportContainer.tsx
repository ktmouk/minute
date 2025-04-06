"use client";

import { endOfDay, endOfWeek, startOfDay, startOfWeek } from "date-fns";
import { useToday } from "../../../_hooks/useToday";
import { ChartList } from "./ChartList";
import { ReportHeader } from "./ReportHeader";

type Props = {
  datePart: "day" | "month";
  dateRange: { start: Date; end: Date } | undefined;
};

export const ReportContainer = ({ datePart, dateRange }: Props) => {
  const today = useToday();

  return (
    <div className="flex-1 h-full p-6 max-w-5xl">
      <div className="border-b-gray-300 pb-4">
        {today !== undefined ? (
          <ReportHeader
            datePart={datePart}
            startDate={startOfDay(
              dateRange !== undefined ? dateRange.start : startOfWeek(today),
            )}
            endDate={endOfDay(
              dateRange !== undefined ? dateRange.end : endOfWeek(today),
            )}
            today={today}
          />
        ) : (
          <div className="flex justify-between w-full">
            <div className="h-10 animate-pulse bg-gray-300 w-72 rounded-sm" />
            <div className="h-10 animate-pulse bg-gray-300 w-20 rounded-sm" />
          </div>
        )}
      </div>
      <div className="mt-4">
        {today !== undefined && (
          <ChartList
            startDate={startOfDay(
              dateRange !== undefined ? dateRange.start : startOfWeek(today),
            )}
            endDate={endOfDay(
              dateRange !== undefined ? dateRange.end : endOfWeek(today),
            )}
            datePart={datePart}
          />
        )}
      </div>
    </div>
  );
};
