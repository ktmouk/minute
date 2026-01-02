import { differenceInSeconds } from "date-fns";
import { useState, useEffect } from "react";

const calcDuration = (startedAt?: Date, stoppedAt?: Date) => {
  const now = new Date();
  return differenceInSeconds(stoppedAt ?? now, startedAt ?? now);
};

export const useDuration = (startedAt?: Date, stoppedAt?: Date) => {
  const [duration, setDuration] = useState(() =>
    calcDuration(startedAt, stoppedAt),
  );

  useEffect(() => {
    if (!startedAt || stoppedAt) return;
    const timerId = setInterval(() => {
      setDuration(calcDuration(startedAt, undefined));
    }, 500);
    return () => {
      clearInterval(timerId);
    };
  }, [startedAt, stoppedAt]);

  return stoppedAt ? calcDuration(startedAt, stoppedAt) : duration;
};
