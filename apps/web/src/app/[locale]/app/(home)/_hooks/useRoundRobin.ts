import { useState, useCallback } from "react";

export const useRoundRobin = <Value>(
  values: readonly Value[],
  initialIndex: number,
) => {
  const [index, setIndex] = useState(initialIndex);

  const next = useCallback(() => {
    setIndex((index) => (index + 1) % values.length);
  }, [setIndex, values]);

  return [values.at(index), next] as const;
};
