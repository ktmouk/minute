import { endOfDay, startOfDay } from "date-fns";
import { fromS } from "hh-mm-ss";
import { useMemo } from "react";
import * as R from "remeda";
import { tv } from "tailwind-variants";
import { Tooltip } from "../../../_components/Tooltip";
import { trpc } from "../../../_components/TrpcProvider";

type Props = {
  date: Date;
};

const durationStyle = tv({
  base: "font-mono",
  variants: {
    isLoading: {
      true: "text-gray-400 animate-pulse",
    },
  },
});

export const TimeEntrySummary = ({ date }: Props) => {
  const allFolders = trpc.folders.getAllFolders.useQuery();
  const timeEntrySummary = trpc.timeEntrySummaries.getTimeEntrySummary.useQuery(
    { startDate: startOfDay(date), endDate: endOfDay(date) },
  );

  const totalDuration = R.sumBy(timeEntrySummary.data ?? [], ({ duration }) =>
    Number(duration),
  );

  const barInfo = useMemo(() => {
    if (timeEntrySummary.data === undefined) return [];

    return (allFolders.data ?? []).map(({ name, id, emoji, color }) => {
      const duration = timeEntrySummary.data.find(
        ({ folderId }) => folderId === id,
      )?.duration;
      return { name, color, emoji, id, duration };
    });
  }, [timeEntrySummary, allFolders]);

  const isLoading =
    timeEntrySummary.data === undefined || allFolders.data === undefined;

  return (
    <div className="flex items-center">
      <div className="flex h-8 items-center">
        <ul className="h-1.5 hover:h-4 group border-8 border-white box-content transition-all w-28 flex gap-px rounded-2xl overflow-hidden">
          {isLoading ? (
            <li className="inline-block bg-gray-300 animate-pulse w-full h-full" />
          ) : (
            barInfo.map(
              ({ id, name, emoji, color, duration }) =>
                duration !== undefined && (
                  <li
                    style={{
                      backgroundColor: color,
                      width: `${((Number(duration) / totalDuration) * 100).toString()}%`,
                    }}
                    className="inline-block transition-all h-full"
                    key={id}
                  >
                    <Tooltip
                      side="top"
                      sideOffset={4}
                      delayDuration={30}
                      content={`${emoji} ${name}: ${fromS(Number(duration), "hh:mm:ss")} ${Math.round((Number(duration) / totalDuration) * 100).toString()}%`}
                    >
                      <span className="h-full w-full items-center justify-center cursor-pointer group-hover:visible invisible inline-flex text-sm" />
                    </Tooltip>
                  </li>
                ),
            )
          )}
        </ul>
      </div>
      <div className="pl-2">
        <span className={durationStyle({ isLoading })}>
          {fromS(totalDuration, "hh:mm:ss")}
        </span>
      </div>
    </div>
  );
};
