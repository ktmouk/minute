import { format, startOfDay } from "date-fns";
import { CalendarPosition } from "../../../_components/CalendarPosition";

export type Props = {
  date: Date;
};

export const CalendarRuler = ({ date }: Props) => {
  return (
    <div className="flex overflow-y-hidden absolute z-10 flex-1 pt-16 w-10 h-full md:w-14">
      <div className="relative w-full">
        <CalendarPosition baseDate={startOfDay(date)} startDate={date}>
          {(style) => (
            <span
              style={style}
              className="block absolute z-10 font-mono text-xs text-center text-white bg-green-500 border-y border-y-white md:text-sm"
            >
              {format(date, "HH:mm")}
            </span>
          )}
        </CalendarPosition>
      </div>
    </div>
  );
};
