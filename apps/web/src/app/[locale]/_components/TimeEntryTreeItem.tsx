import { differenceInDays, formatISO, isSameYear } from "date-fns";
import { useFormatter } from "next-intl";
import { useMemo } from "react";
import { PiTimer } from "react-icons/pi";
import { Duration } from "../_components/Duration";
import { TreePath } from "../_components/TreePath";

type Props = {
  depth: number;
  color: string;
  startedAt: Date;
  stoppedAt: Date;
  now: Date;
};

export const TimeEntryTreeItem = ({
  depth,
  color,
  startedAt,
  stoppedAt,
  now,
}: Props) => {
  const formatDate = useFormatter();

  const readableDate = useMemo(() => {
    return differenceInDays(now, startedAt) < 4
      ? formatDate.relativeTime(startedAt, { now, unit: "day" })
      : formatDate.dateTime(
          startedAt,
          isSameYear(startedAt, now) ? "short" : "long",
        );
  }, [formatDate, startedAt, now]);

  const handleClick = () => {
    /** TODO */
  };

  return (
    <li>
      <button
        type="button"
        className="block w-full px-4 text-sm hover:bg-gray-200"
        onClick={handleClick}
      >
        <TreePath depth={depth}>
          <span
            title={formatISO(startedAt)}
            className="ml-4 flex w-full min-w-0 items-center py-1.5"
          >
            <span style={{ color }}>
              <PiTimer size={20} className="mr-1 shrink-0" />
            </span>
            <span className="truncate">
              <Duration startedAt={startedAt} stoppedAt={stoppedAt} />・
              {readableDate}
            </span>
          </span>
        </TreePath>
      </button>
    </li>
  );
};
