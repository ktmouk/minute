"use client";

import { format, toDate } from "date-fns";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { PiTimer } from "react-icons/pi";
import * as R from "remeda";
import { trpc } from "../../../_components/TrpcProvider";
import { useInfiniteScroll } from "../_hooks/useInfiniteScroll";
import { TimeEntryList } from "./TimeEntryList";

export const TimeEntryTimeline = () => {
  const t = useTranslations("components.TimeEntryTimeline");

  const { fetchNextPage, isLoading, ...timeEntryPages } =
    trpc.timeEntries.getTimeEntries.useInfiniteQuery(
      {},
      { getNextPageParam: ({ nextCursor }) => nextCursor },
    );

  const onReachEnd = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const { observerRef } = useInfiniteScroll(onReachEnd);

  const timeEntries = useMemo(() => {
    const timeEntries = (timeEntryPages.data?.pages ?? []).flatMap(
      ({ items }) => items,
    );
    return R.groupBy(timeEntries, ({ startedAt }) =>
      format(startedAt, "yyyy-MM-dd"),
    );
  }, [timeEntryPages]);

  const isEmpty = !isLoading && Object.keys(timeEntries).length === 0;

  return (
    <section className="mt-10">
      {isEmpty ? (
        <div className="flex rounded-sm flex-col items-center">
          <PiTimer className="text-4xl text-gray-300" />
          <div className="mt-4">
            <h2 className="text-center text-gray-600">{t("welcome")}</h2>
            <p className="text-sm text-gray-500">{t("noTimeEntriesYet")}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {Object.keys(timeEntries).map((date) => (
            <TimeEntryList
              key={date}
              date={toDate(date)}
              timeEntries={timeEntries[date] ?? []}
            />
          ))}
          <span ref={observerRef} />
        </div>
      )}
    </section>
  );
};
