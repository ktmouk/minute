import * as R from "remeda";

export const CalendarRowLines = () => {
  return (
    <div aria-hidden className="flex flex-col flex-1 h-full w-14">
      {R.times(24, (hour) => {
        const padded = `${hour.toString().padStart(2, "0")}:00`;
        return (
          <span
            key={hour}
            className="block h-full font-mono text-xs text-center text-gray-500 md:text-sm"
            style={{
              minHeight: "2.7rem",
            }}
          >
            {hour > 0 && (
              <span className="block absolute w-full border-b border-b-gray-300 border-dashed" />
            )}
            <time className="inline-block pt-1" dateTime={padded}>
              {padded}
            </time>
          </span>
        );
      })}
    </div>
  );
};
