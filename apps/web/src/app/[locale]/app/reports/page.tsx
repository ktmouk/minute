import { isBefore, isSameDay, isValid, toDate } from "date-fns";
import { z } from "zod";
import { ReportContainer } from "./_components/ReportContainer";

const Page = async (props: { searchParams: Promise<unknown> }) => {
  const searchParams = await props.searchParams;
  const { datePart, dateRange } = z
    .strictObject({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      datePart: z.enum(["day", "month"]),
    })
    .transform(({ startDate, endDate, datePart }) => ({
      dateRange:
        typeof startDate === "string" && typeof endDate === "string"
          ? { start: toDate(startDate), end: toDate(endDate) }
          : undefined,
      datePart,
    }))
    .refine(
      ({ dateRange }) =>
        dateRange !== undefined &&
        isValid(dateRange.start) &&
        isValid(dateRange.end) &&
        (isSameDay(dateRange.start, dateRange.end) ||
          isBefore(dateRange.start, dateRange.end)),
    )
    .catch(() => ({
      dateRange: undefined,
      datePart: "day" as const,
    }))
    .parse(searchParams);

  return <ReportContainer datePart={datePart} dateRange={dateRange} />;
};

export default Page;
