"use client";

import { addWeeks, format, isSameWeek, startOfWeek } from "date-fns";
import { useTranslations } from "next-intl";
import { PiCalendarBlank } from "react-icons/pi";
import { useRouter } from "../../../../../navigation";
import { DatePicker } from "../../../_components/DatePicker";

type Props = {
  date: Date;
  today: Date;
};

export const CalendarHeader = ({ date, today }: Props) => {
  const t = useTranslations("components.CalendarHeader");
  const router = useRouter();

  const changeDate = ({
    date,
    isHighlighted,
  }: {
    date: Date;
    isHighlighted: boolean;
  }) => {
    router.push(
      `/app/calendar?date=${format(date, "yyyy-MM-dd")}&isHighlighted=${isHighlighted ? "true" : "false"}`,
    );
  };

  return (
    <div className="flex gap-4">
      <DatePicker
        startDate={date}
        onClickPrev={() => {
          changeDate({
            date: startOfWeek(addWeeks(date, -1)),
            isHighlighted: false,
          });
        }}
        onClickNext={() => {
          changeDate({
            date: startOfWeek(addWeeks(date, 1)),
            isHighlighted: false,
          });
        }}
        onStartDateChange={(date) => {
          changeDate({ date, isHighlighted: true });
        }}
      />
      {!isSameWeek(today, date) && (
        <button
          onClick={() => {
            changeDate({ date: today, isHighlighted: false });
          }}
          className="h-10 px-3 flex items-center gap-0.5 hover:bg-gray-200 text-green-500 border border-gray-300 rounded text-sm"
        >
          <PiCalendarBlank className="text-lg" />
          {t("today")}
        </button>
      )}
    </div>
  );
};
