import { endOfWeek, isValid, startOfWeek, toDate } from "date-fns";
import { z } from "zod";
import { Calendar } from "./_components/Calendar";
import { CalendarHeader } from "./_components/CalendarHeader";

const Page = ({ searchParams }: { searchParams: unknown }) => {
  const today = new Date();

  const { date, isHighlighted } = z
    .strictObject({
      date: z.string(),
      isHighlighted: z.enum(["true", "false"]),
    })
    .transform(({ date, isHighlighted }) => ({
      date: toDate(date),
      isHighlighted,
    }))
    .refine(({ date }) => isValid(date))
    .catch(() => ({ date: today, isHighlighted: "false" as const }))
    .parse(searchParams);

  return (
    <div className="flex-1 h-full min-h-screen flex-col flex p-6 max-w-5xl">
      <div className="mb-6">
        <CalendarHeader today={today} date={date} />
      </div>
      <div className="flex-1">
        <Calendar
          today={today}
          highlightedDate={isHighlighted === "true" ? date : undefined}
          startDate={startOfWeek(date)}
          endDate={endOfWeek(date)}
        />
      </div>
    </div>
  );
};

export default Page;
