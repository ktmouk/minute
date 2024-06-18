import { clamp, differenceInSeconds, endOfDay, startOfDay } from "date-fns";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  baseDate: Date;
  startDate: Date;
  endDate?: Date;
  children?: (style: CSSProperties) => ReactNode;
  elevation?: number;
  maxElevation?: number;
};

const getPercent = (dateLeft: Date, dateRight: Date) => {
  return (differenceInSeconds(dateLeft, dateRight) / (60 * 60 * 24)) * 100;
};

const CalendarPosition = ({
  baseDate,
  startDate,
  endDate,
  children,
  elevation = 0,
  maxElevation = 0,
}: Props) => {
  const offsetPercent = (elevation / (maxElevation + 1)) * 100;

  const clampByDate = (target: Date) => {
    return clamp(target, {
      start: startOfDay(baseDate),
      end: endOfDay(baseDate),
    });
  };

  return (
    <>
      {children?.({
        top: `${getPercent(clampByDate(startDate), baseDate)}%`,
        left: `${offsetPercent}%`,
        width: `${100 - offsetPercent}%`,
        height: endDate
          ? `${getPercent(clampByDate(endDate), clampByDate(startDate))}%`
          : undefined,
      })}
    </>
  );
};

export default CalendarPosition;
