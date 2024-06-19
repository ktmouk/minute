import { differenceInDays, formatISO, isSameYear, startOfDay } from "date-fns";
import { useFormatter, useLocale } from "next-intl";
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

const capitalize = (text: string) => {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
};

export const TimeEntryTreeItem = ({
  depth,
  color,
  startedAt,
  stoppedAt,
  now,
}: Props) => {
  const formatDate = useFormatter();
  const locale = useLocale();

  const readableDate = useMemo(() => {
    return differenceInDays(now, startedAt) < 4
      ? capitalize(
          new Intl.RelativeTimeFormat(locale, {
            numeric: "auto",
          }).format(
            differenceInDays(startOfDay(startedAt), startOfDay(now)),
            "day",
          ),
        )
      : formatDate.dateTime(
          startedAt,
          isSameYear(startedAt, now) ? "short" : "long",
        );
  }, [formatDate, startedAt, locale, now]);

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
