"use client";

import { format, isAfter, isBefore, isValid, parse } from "date-fns";
import { useTranslations } from "next-intl";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";
import { Tooltip } from "../_components/Tooltip";

type Props = {
  startDate: Date;
  endDate?: Date;
  onClickPrev: () => void;
  onClickNext: () => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange?: (date: Date) => void;
};

export const DatePicker = ({
  startDate,
  endDate,
  onClickNext,
  onClickPrev,
  onStartDateChange,
  onEndDateChange,
}: Props) => {
  const [startDateValue, setStartDateValue] = useState(
    format(startDate, "yyyy-MM-dd"),
  );
  const [endDateValue, setEndDateValue] = useState(
    format(endDate ?? startDate, "yyyy-MM-dd"),
  );

  const t = useTranslations("components.DatePicker");

  const handleChangeStartDate = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setStartDateValue(value);
    const selectedDate = parse(value, "yyyy-MM-dd", new Date());
    if (
      isValid(selectedDate) &&
      (endDate === undefined || isBefore(selectedDate, endDate))
    ) {
      onStartDateChange(selectedDate);
      return;
    }
  };

  const handleChangeEndDate = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEndDateValue(value);
    const selectedDate = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(selectedDate) && isAfter(selectedDate, startDate)) {
      onEndDateChange?.(selectedDate);
      return;
    }
  };

  useEffect(() => {
    setStartDateValue(format(startDate, "yyyy-MM-dd"));
    setEndDateValue(format(endDate ?? startDate, "yyyy-MM-dd"));
  }, [startDate, endDate]);

  return (
    <div className="inline-flex h-10 overflow-hidden border border-gray-300 rounded-sm">
      <Tooltip sideOffset={5} content={t("prev")}>
        <button
          type="button"
          className="px-2 cursor-pointer group hover:bg-gray-200 border-gray-300"
          onClick={() => {
            onClickPrev();
          }}
        >
          <PiCaretLeft className="text-lg transition-all group-hover:-translate-x-0.5" />
        </button>
      </Tooltip>
      <div className="flex items-center">
        <Tooltip
          sideOffset={5}
          content={t(endDate !== undefined ? "selectStartDate" : "selectDate")}
        >
          <input
            type="date"
            className="px-2 outline-hidden h-full text-sm hover:bg-gray-200 placeholder-gray-400"
            onChange={handleChangeStartDate}
            value={startDateValue}
          />
        </Tooltip>
        {endDate !== undefined && (
          <>
            <span className="h-px w-4 bg-gray-400"></span>
            <Tooltip sideOffset={5} content={t("selectEndDate")}>
              <input
                type="date"
                className="px-2 h-full text-sm hover:bg-gray-200 placeholder-gray-400"
                onChange={handleChangeEndDate}
                value={endDateValue}
              />
            </Tooltip>
          </>
        )}
      </div>
      <Tooltip sideOffset={5} content={t("next")}>
        <button
          type="button"
          className="px-2 cursor-pointer hover:bg-gray-200 border-gray-300 group"
          onClick={() => {
            onClickNext();
          }}
        >
          <PiCaretRight className="text-lg transition-all group-hover:translate-x-0.5" />
        </button>
      </Tooltip>
    </div>
  );
};
