"use client";

import { fromS } from "hh-mm-ss";
import { useEffect } from "react";
import { useDuration } from "../_hooks/useDuration";
import { trpc } from "./TrpcProvider";

export const PageTitle = () => {
  const runningTimeEntry = trpc.runningTimeEntry.getRunningTimeEntry.useQuery(
    undefined,
    {
      refetchOnWindowFocus: true,
    },
  );

  const duration = useDuration(runningTimeEntry.data?.startedAt);

  useEffect(() => {
    if (runningTimeEntry.data) {
      const formattedDuration = fromS(duration, "hh:mm:ss");
      const description = runningTimeEntry.data.description || "";
      document.title = `${formattedDuration}・${description} - minute`;
    } else {
      document.title = "minute";
    }
    return () => {
      document.title = "minute";
    };
  }, [runningTimeEntry.data, duration]);

  return null;
};
