import { differenceInSeconds } from "date-fns";
import { useState, useEffect } from "react";

const calcDuration = (startedAt?: Date, stoppedAt?: Date) => {
  const now = new Date();
  return differenceInSeconds(stoppedAt ?? now, startedAt ?? now);
};

export const useDuration = (startedAt?: Date, stoppedAt?: Date) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!startedAt || stoppedAt) return;

    const timerId = setInterval(() => {
      setDuration(calcDuration(startedAt, undefined));
    }, 500);
    return () => {
      clearInterval(timerId);
    };
  }, [startedAt, stoppedAt]);

  if (!startedAt && duration !== 0) {
    setDuration(0);
  }

  return stoppedAt ? calcDuration(startedAt, stoppedAt) : duration;
};
