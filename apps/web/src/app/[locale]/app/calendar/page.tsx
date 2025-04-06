import { isValid, toDate } from "date-fns";
import { z } from "zod";
import { Calendar } from "./_components/Calendar";

const Page = async (props: { searchParams: Promise<unknown> }) => {
  const searchParams = await props.searchParams;
  const { date, isHighlighted } = z
    .strictObject({
      date: z.string().optional(),
      isHighlighted: z.enum(["true", "false"]),
    })
    .transform(({ date, isHighlighted }) => ({
      date: typeof date === "string" ? toDate(date) : undefined,
      isHighlighted,
    }))
    .refine(({ date }) => isValid(date))
    .catch(() => ({ date: undefined, isHighlighted: "false" as const }))
    .parse(searchParams);

  return <Calendar date={date} isHighlighted={isHighlighted === "true"} />;
};

export default Page;
