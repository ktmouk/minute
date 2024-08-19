"use client";

import { format, getDay } from "date-fns";
import { useFormatter } from "next-intl";
import { tv } from "tailwind-variants";

type Props = {
  date: Date;
  isHighlighted: boolean;
  isToday: boolean;
};

type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const containerStyle = tv({
  base: "h-16 flex items-center justify-center border-b border-gray-300",
  variants: {
    isHighlighted: {
      true: "bg-gray-200 ",
    },
  },
});

const dateStyle = tv({
  base: "text-md leading-none flex items-center justify-center rounded-full",
  variants: {
    isToday: {
      true: "text-white bg-green-500 p-1.5",
    },
  },
});

const weekdayStyle = tv({
  base: "text-sm ml-0.5 text-gray-500",
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

export const CalendarContentColumnHeader = ({
  date,
  isToday,
  isHighlighted,
}: Props) => {
  const formatDate = useFormatter();

  return (
    <header className={containerStyle({ isHighlighted })}>
      <span className={dateStyle({ isToday })}>{format(date, "dd")}</span>
      <span className={weekdayStyle({ weekday: getDay(date) as Weekday })}>
        {formatDate.dateTime(date, { weekday: "short" })}
      </span>
    </header>
  );
};
