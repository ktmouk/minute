import { CalendarContent } from "./CalendarContent";

type Props = {
  today: Date;
  startDate: Date;
  endDate: Date;
  highlightedDate: Date | undefined;
};

export const Calendar = ({
  today,
  startDate,
  endDate,
  highlightedDate,
}: Props) => {
  return (
    <div className="flex h-full relative justify-between border border-gray-300 rounded">
      <CalendarContent
        today={today}
        highlightedDate={highlightedDate}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
};
