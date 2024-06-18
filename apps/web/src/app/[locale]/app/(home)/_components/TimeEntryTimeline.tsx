"use client";

import { format, toDate } from "date-fns";
import { useCallback, useMemo } from "react";
import * as R from "remeda";
import { trpc } from "../../../_components/TrpcProvider";
import { useInfiniteScroll } from "../_hooks/useInfiniteScroll";
import { TimeEntryList } from "./TimeEntryList";

export const TimeEntryTimeline = () => {
  const { fetchNextPage, ...timeEntryPages } =
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

  return (
    <>
      {Object.keys(timeEntries).map((date) => (
        <TimeEntryList
          key={date}
          date={toDate(date)}
          timeEntries={timeEntries[date] ?? []}
        />
      ))}
      <span ref={observerRef} />
    </>
  );
};
