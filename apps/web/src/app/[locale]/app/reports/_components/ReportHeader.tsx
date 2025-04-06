"use client";

import { Label, Listbox } from "@headlessui/react";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useTranslations } from "next-intl";
import { tv } from "tailwind-variants";
import { useRouter } from "../../../../../i18n/navigation";
import { DatePicker } from "../../../_components/DatePicker";
import { ListboxButton } from "../../../_components/ListboxButton";
import { ListboxOption } from "../../../_components/ListboxOption";
import { ListboxOptions } from "../../../_components/ListboxOptions";

type Props = {
  startDate: Date;
  endDate: Date;
  datePart: string;
  today: Date;
};

const dateParts = [
  { id: "perDay", value: "day" },
  { id: "perMonth", value: "month" },
] as const;

const presets = [
  {
    id: "beforeWeek",
    datePart: "day",
    getStartDate: (today: Date) => addDays(today, -7),
    getEndDate: (today: Date) => today,
  },
  {
    id: "beforeMonth",
    datePart: "day",
    getStartDate: (today: Date) => addDays(today, -30),
    getEndDate: (today: Date) => today,
  },
  {
    id: "beforeYear",
    datePart: "month",
    getStartDate: (today: Date) => addYears(today, -1),
    getEndDate: (today: Date) => today,
  },
  {
    id: "thisWeek",
    datePart: "day",
    getStartDate: (today: Date) => startOfWeek(today),
    getEndDate: (today: Date) => endOfWeek(today),
  },
  {
    id: "thisMonth",
    datePart: "day",
    getStartDate: (today: Date) => startOfMonth(today),
    getEndDate: (today: Date) => endOfMonth(today),
  },
  {
    id: "prevWeek",
    datePart: "day",
    getStartDate: (today: Date) => startOfWeek(addWeeks(today, -1)),
    getEndDate: (today: Date) => endOfWeek(addWeeks(today, -1)),
  },
  {
    id: "prevMonth",
    datePart: "day",
    getStartDate: (today: Date) => startOfMonth(addMonths(today, -1)),
    getEndDate: (today: Date) => endOfMonth(addMonths(today, -1)),
  },
] as const;

const datePartList = tv({
  base: "px-4 text-sm py-2 border-gray-300",
  variants: {
    isSelected: {
      true: "text-white bg-green-500",
      false: "hover:bg-gray-200",
    },
  },
});

export const ReportHeader = ({
  today,
  startDate,
  endDate,
  datePart,
}: Props) => {
  const t = useTranslations("components.ReportHeader");
  const router = useRouter();

  const handleChange = ({
    startDate,
    endDate,
    datePart,
  }: {
    startDate: Date;
    endDate: Date;
    datePart: string;
  }) => {
    router.push(
      `/app/reports?startDate=${format(startDate, "yyyy-MM-dd")}&endDate=${format(endDate, "yyyy-MM-dd")}&datePart=${datePart}`,
    );
  };

  const selectedDatePart =
    dateParts.find(({ value }) => datePart === value) ?? dateParts[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-6">
        <DatePicker
          startDate={startDate}
          endDate={endDate}
          onClickPrev={() => {
            const diff = differenceInDays(endDate, startDate) + 1;
            handleChange({
              startDate: addDays(startDate, -diff),
              endDate: addDays(endDate, -diff),
              datePart,
            });
          }}
          onClickNext={() => {
            const diff = differenceInDays(endDate, startDate) + 1;
            handleChange({
              startDate: addDays(startDate, diff),
              endDate: addDays(endDate, diff),
              datePart,
            });
          }}
          onStartDateChange={(date) => {
            handleChange({ startDate: date, endDate, datePart });
          }}
          onEndDateChange={(date) => {
            handleChange({ startDate, endDate: date, datePart });
          }}
        />
        <div className="flex items-center gap-2">
          <Listbox
            value={selectedDatePart}
            onChange={(datePart) => {
              handleChange({ startDate, endDate, datePart: datePart.value });
            }}
          >
            <Label className="text-sm text-gray-500">{t("unit")}:</Label>
            <div className="relative">
              <ListboxButton label={t(selectedDatePart.id)} />
              <ListboxOptions>
                {dateParts.map((value) => (
                  <ListboxOption key={value.id} value={value}>
                    {t(value.id)}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
      </div>
      <div className="flex justify-between items-end text-sm">
        <div className="flex items-center shrink-0">
          <span className="text-gray-500 mr-2">{t("fromToday")}:</span>
          <ul className="flex border border-gray-300 rounded-sm divide-x divide-gray-200 overflow-hidden">
            {presets.map((preset) => {
              const isSelected =
                datePart === preset.datePart &&
                isSameDay(preset.getEndDate(today), endDate) &&
                isSameDay(preset.getStartDate(today), startDate);
              return (
                <li key={preset.id}>
                  <button
                    type="button"
                    className={datePartList({ isSelected })}
                    onClick={() => {
                      handleChange({
                        startDate: preset.getStartDate(today),
                        endDate: preset.getEndDate(today),
                        datePart: preset.datePart,
                      });
                    }}
                  >
                    {t(preset.id)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
