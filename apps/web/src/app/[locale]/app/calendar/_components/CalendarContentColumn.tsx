"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Folder, Task, TimeEntry } from "@minute/schemas";
import {
  areIntervalsOverlapping,
  endOfDay,
  formatISO,
  isSameDay,
  min,
  startOfDay,
} from "date-fns";
import { useState } from "react";
import { CalendarEvent } from "../../../_components/CalendarEvent";
import { CalendarPosition } from "../../../_components/CalendarPosition";
import { TimeEntryModal } from "../../../_components/TimeEntryModal";
import { useEventElevations } from "../../../_hooks/useEventElevations";
import { CalendarDraggableEvent } from "./CalendarDraggableEvent";
import { CalendarTodayLine } from "./CalendarTodayLine";

type Props = {
  baseDate: Date;
  ghostEvent:
    | {
        id: string;
        emoji: string;
        title: string;
        color: string;
        startDate: Date;
        endDate: Date;
      }
    | undefined;
  timeEntries: (TimeEntry & { task: Task & { folder: Folder } })[];
};

const isOverlapped = (
  event: { startDate: Date; endDate: Date },
  date: Date,
) => {
  return areIntervalsOverlapping(
    { start: startOfDay(date), end: endOfDay(date) },
    { start: event.startDate, end: event.endDate },
  );
};

export const CalendarContentColumn = ({
  baseDate,
  ghostEvent,
  timeEntries,
}: Props) => {
  const [editingTimeEntry, setEditingTimeEntry] = useState<
    (TimeEntry & { task: Task & { folder: Folder } }) | undefined
  >(undefined);

  const now = new Date();
  const evelations = useEventElevations(timeEntries);

  const { setNodeRef } = useDroppable({
    id: formatISO(baseDate),
    data: { baseDate },
  });

  const handeClickEvent = (
    timeEntry: TimeEntry & { task: Task & { folder: Folder } },
  ) => {
    setEditingTimeEntry(timeEntry);
  };

  return (
    <div ref={setNodeRef}>
      {isSameDay(now, baseDate) && (
        <CalendarPosition startDate={now} baseDate={baseDate}>
          {(style) => {
            return (
              <div className="absolute pointer-events-none z-10" style={style}>
                <CalendarTodayLine />
              </div>
            );
          }}
        </CalendarPosition>
      )}
      {ghostEvent && isOverlapped(ghostEvent, baseDate) && (
        <CalendarPosition
          startDate={ghostEvent.startDate}
          endDate={ghostEvent.endDate}
          baseDate={baseDate}
        >
          {(style) => {
            return (
              <div className="absolute z-20 min-h-[1.7rem]" style={style}>
                <CalendarEvent
                  emoji={ghostEvent.emoji}
                  title={ghostEvent.title}
                  color={ghostEvent.color}
                  startDate={ghostEvent.startDate}
                  endDate={min([ghostEvent.endDate, endOfDay(baseDate)])}
                />
              </div>
            );
          }}
        </CalendarPosition>
      )}
      {evelations.map(({ event, elevation, maxElevation }) => (
        <CalendarPosition
          key={event.id}
          baseDate={baseDate}
          startDate={event.startedAt}
          endDate={event.stoppedAt}
          elevation={elevation}
          maxElevation={maxElevation}
        >
          {(style) => (
            <div className="absolute min-h-[1.7rem]" style={style}>
              <CalendarDraggableEvent
                id={event.id}
                emoji={event.task.folder.emoji}
                title={event.task.description}
                color={event.task.folder.color}
                startDate={event.startedAt}
                endDate={min([event.stoppedAt, endOfDay(baseDate)])}
                isDragging={
                  ghostEvent !== undefined && event.id === ghostEvent.id
                }
                onClick={() => {
                  handeClickEvent(event);
                }}
              />
            </div>
          )}
        </CalendarPosition>
      ))}
      {editingTimeEntry !== undefined && (
        <TimeEntryModal
          id={editingTimeEntry.id}
          folderId={editingTimeEntry.task.folder.id}
          description={editingTimeEntry.task.description}
          startedAt={editingTimeEntry.startedAt}
          stoppedAt={editingTimeEntry.stoppedAt}
          onClose={() => {
            setEditingTimeEntry(undefined);
          }}
        />
      )}
    </div>
  );
};
