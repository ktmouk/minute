"use client";

import type { DragMoveEvent } from "@dnd-kit/core";
import {
  DndContext,
  MouseSensor,
  closestCorners,
  useSensor,
} from "@dnd-kit/core";
import {
  addDays,
  addSeconds,
  areIntervalsOverlapping,
  differenceInDays,
  differenceInSeconds,
  eachDayOfInterval,
  endOfDay,
  formatISO,
  isSameDay,
  roundToNearestMinutes,
  startOfDay,
} from "date-fns";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import * as R from "remeda";
import { z } from "zod";
import { trpc } from "../../../_components/TrpcProvider";
import { useToast } from "../../../_hooks/useToast";
import { CalendarContentColumn } from "./CalendarContentColumn";
import { CalendarContentColumnHeader } from "./CalendarContentColumnHeader";
import { CalendarRowLines } from "./CalendarRowLines";
import { CalendarRuler } from "./CalendarRuler";

const ghostEventSchema = z.strictObject({
  id: z.string().uuid(),
  emoji: z.string(),
  color: z.string(),
  title: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

type GhostEvent = z.infer<typeof ghostEventSchema>;

type Props = {
  highlightedDate: Date | undefined;
  startDate: Date;
  endDate: Date;
  today: Date;
};

const isOverlapped = (
  event: { startedAt: Date; stoppedAt: Date },
  date: Date,
) => {
  return areIntervalsOverlapping(
    { start: startOfDay(date), end: endOfDay(date) },
    { start: event.startedAt, end: event.stoppedAt },
  );
};

const getRect = (rectable: HTMLElement | null) => {
  return rectable?.getBoundingClientRect() ?? new DOMRect();
};

const toSeconds = (amount: number, rect: DOMRect) => {
  return (amount * (24 * 60 * 60)) / rect.height;
};

export const CalendarContent = ({
  today,
  highlightedDate,
  startDate,
  endDate,
}: Props) => {
  const t = useTranslations("components.CalendarContent");
  const utils = trpc.useUtils();
  const { notify } = useToast();

  const moveTimeEntry = trpc.timeEntries.updateTimeEntry.useMutation({
    onSuccess: async () => {
      notify(t("timeEntryMoved"));
      await utils.timeEntries.invalidate();
    },
  });

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [ghostEvent, setGhostEvent] = useState<GhostEvent | undefined>(
    undefined,
  );

  const timeEntries = trpc.timeEntries.getCalendarTimeEntries.useQuery({
    startDate,
    endDate,
  });

  const dates = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const groupedTimeEntries = useMemo(() => {
    return R.mapToObj(dates, (date) => [
      formatISO(date),
      (timeEntries.data ?? []).filter((timeEntry) =>
        isOverlapped(timeEntry, date),
      ),
    ]);
  }, [dates, timeEntries]);

  const handleDragMove = (event: DragMoveEvent) => {
    if (event.over === null || contentRef.current === null) return;

    const data = ghostEventSchema.parse(event.active.data.current);
    const { baseDate } = z
      .strictObject({ baseDate: z.date() })
      .parse(event.over.data.current);

    const startDate = roundToNearestMinutes(
      addSeconds(
        addDays(
          data.startDate,
          differenceInDays(startOfDay(baseDate), startOfDay(data.startDate)),
        ),
        toSeconds(event.delta.y, getRect(contentRef.current)),
      ),
      { nearestTo: 15 },
    );
    const endDate = addSeconds(
      startDate,
      differenceInSeconds(data.endDate, data.startDate),
    );
    setGhostEvent({ ...data, startDate, endDate });
  };

  const handleDragEnd = async () => {
    if (ghostEvent === undefined) return;

    await moveTimeEntry.mutateAsync({
      id: ghostEvent.id,
      startedAt: ghostEvent.startDate,
      stoppedAt: ghostEvent.endDate,
    });
    setGhostEvent(undefined);
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  return (
    <>
      <div className="flex flex-col box-border w-13 border-r border-gray-300">
        <span className="h-16 sticky z-10 top-0 bg-white border-b block border-gray-300"></span>
        {ghostEvent && (
          <>
            <CalendarRuler date={ghostEvent.endDate} />
            <CalendarRuler date={ghostEvent.startDate} />
          </>
        )}
        <CalendarRowLines />
      </div>
      <div className="flex flex-1 divide-x divide-gray-300">
        <DndContext
          collisionDetection={closestCorners}
          sensors={[mouseSensor]}
          onDragMove={handleDragMove}
          onDragEnd={() => void handleDragEnd()}
        >
          {dates.map((date) => {
            return (
              <section
                key={formatISO(date)}
                className="flex h-full flex-1 flex-col"
              >
                <div className="sticky top-0 z-30 bg-white">
                  <CalendarContentColumnHeader
                    date={date}
                    isToday={isSameDay(today, date)}
                    isHighlighted={
                      highlightedDate !== undefined &&
                      isSameDay(date, highlightedDate)
                    }
                  />
                </div>
                <div className="flex-1">
                  <div ref={contentRef} className="relative h-full">
                    <CalendarContentColumn
                      timeEntries={groupedTimeEntries[formatISO(date)] ?? []}
                      ghostEvent={ghostEvent}
                      baseDate={date}
                    />
                  </div>
                </div>
              </section>
            );
          })}
        </DndContext>
      </div>
    </>
  );
};
