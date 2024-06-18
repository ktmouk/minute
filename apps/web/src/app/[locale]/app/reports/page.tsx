import {
  addDays,
  endOfDay,
  isBefore,
  isSameDay,
  isValid,
  startOfDay,
  toDate,
} from "date-fns";
import { z } from "zod";
import { ChartList } from "./_components/ChartList";
import { ReportHeader } from "./_components/ReportHeader";

const Page = ({ searchParams }: { searchParams: unknown }) => {
  const today = new Date();

  const { datePart, startDate, endDate } = z
    .strictObject({
      startDate: z.string(),
      endDate: z.string(),
      datePart: z.enum(["day", "month"]),
    })
    .transform(({ startDate, endDate, datePart }) => ({
      startDate: toDate(startDate),
      endDate: toDate(endDate),
      datePart,
    }))
    .refine(
      ({ startDate, endDate }) =>
        isValid(startDate) &&
        isValid(endDate) &&
        (isSameDay(startDate, endDate) || isBefore(startDate, endDate)),
    )
    .catch(() => ({
      startDate: addDays(today, -7),
      endDate: today,
      datePart: "day" as const,
    }))
    .parse(searchParams);

  return (
    <div className="flex-1 h-full p-6 max-w-5xl">
      <div className="border-b-gray-300 pb-4">
        <ReportHeader
          datePart={datePart}
          startDate={startDate}
          endDate={endDate}
          today={today}
        />
      </div>
      <div className="mt-4">
        <ChartList
          startDate={startOfDay(startDate)}
          endDate={endOfDay(endDate)}
          datePart={datePart}
        />
      </div>
    </div>
  );
};

export default Page;
