import chroma from "chroma-js";
import { format } from "date-fns";

export type Props = {
  emoji: string;
  color: string;
  title: string;
  startDate: Date;
  endDate: Date;
};

export const CalendarEvent = ({
  emoji,
  title,
  color,
  startDate,
  endDate,
}: Props) => {
  return (
    <div className="overflow-hidden absolute rounded-xs w-full h-full font-medium leading-tight border-y border-white text-xs">
      <div
        className="py-1 px-1.5 w-full h-full text-left border-l-2"
        style={{
          backgroundColor: chroma(color).mix(chroma("white"), 0.65).hex(),
          borderLeftColor: chroma(color).hex(),
          color: chroma(color).darken(0.7).hex(),
        }}
      >
        <span className="mr-1 break-all">
          {emoji} {title}
        </span>
        <span
          className="font-mono text-white whitespace-normal rounded-xs md:whitespace-nowrap"
          style={{
            color: chroma(color).darken(0.7).hex(),
          }}
        >
          {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
        </span>
      </div>
    </div>
  );
};
