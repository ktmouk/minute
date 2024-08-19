import {
  areIntervalsOverlapping,
  compareAsc,
  compareDesc,
  addMinutes,
} from "date-fns";
import { useMemo } from "react";

type Event = {
  startedAt: Date;
  stoppedAt: Date;
};

type EventElevation<T extends Event> = {
  event: T;
  elevation: number;
  maxElevation: number;
};

const isOverlapped = (current: Event, target: Event) => {
  const currentInterval = {
    start: current.startedAt,
    end: addMinutes(current.startedAt, 30),
  };
  const targetInterval = {
    start: target.startedAt,
    end: target.stoppedAt,
  };
  return areIntervalsOverlapping(currentInterval, targetInterval, {
    inclusive: true,
  });
};

const walk = (
  eventElevations: EventElevation<Event>[],
  index: number,
  elevation: number,
) => {
  const current = eventElevations.at(index);
  if (current === undefined) return;

  current.elevation = current.maxElevation = elevation;
  let nextIndex = index;

  for (let i = nextIndex + 1; i < eventElevations.length; i++) {
    const elevation = eventElevations[i];
    if (
      elevation === undefined ||
      !isOverlapped(current.event, elevation.event)
    )
      break;

    const result = walk(eventElevations, i, current.elevation + 1);
    if (result === undefined) break;

    current.maxElevation = Math.max(result.maxElevation, current.maxElevation);
    i = nextIndex = result.nextIndex;
  }
  return { nextIndex, maxElevation: current.maxElevation };
};

const sort = <T extends Event>(timeEntries: T[]) => {
  return [...timeEntries]
    .sort((a, b) => compareDesc(a.stoppedAt, b.stoppedAt))
    .sort((a, b) => compareAsc(a.startedAt, b.startedAt));
};

export const useEventElevations = <T extends Event>(timeEntries: T[]) => {
  return useMemo(() => {
    const eventElevations = sort(timeEntries).map((event) => ({
      event,
      elevation: 0,
      maxElevation: 0,
    }));
    for (let i = 0; i < eventElevations.length; i++) {
      const result = walk(eventElevations, i, 0);
      i = result?.nextIndex ?? eventElevations.length;
    }
    return eventElevations;
  }, [timeEntries]);
};
