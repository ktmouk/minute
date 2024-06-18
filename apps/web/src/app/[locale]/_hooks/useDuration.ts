import { differenceInSeconds } from "date-fns";
import { useState, useEffect, useCallback } from "react";

const calcDuration = (startedAt?: Date, stoppedAt?: Date) => {
  const now = new Date();
  return differenceInSeconds(stoppedAt ?? now, startedAt ?? now);
};

export const useDuration = (startedAt?: Date, stoppedAt?: Date) => {
  const [duration, setDuration] = useState(0);

  const updateDuration = useCallback(() => {
    setDuration(calcDuration(startedAt, stoppedAt));
  }, [startedAt, stoppedAt]);

  useEffect(() => {
    updateDuration();

    if (startedAt && !stoppedAt) {
      const timerId = setInterval(updateDuration, 500);
      return () => {
        clearInterval(timerId);
      };
    }
    return;
  }, [startedAt, stoppedAt, updateDuration]);

  return duration;
};
