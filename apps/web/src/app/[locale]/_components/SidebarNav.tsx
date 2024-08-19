import { useTranslations } from "next-intl";
import { PiTimer, PiCalendarBlank, PiChartBar } from "react-icons/pi";
import { Duration } from "./Duration";
import { SidebarNavItem } from "./SidebarNavItem";
import { trpc } from "./TrpcProvider";

export const SidebarNav = () => {
  const t = useTranslations("components.SidebarNav");
  const runningTimeEntry = trpc.runningTimeEntry.getRunningTimeEntry.useQuery();

  return (
    <nav>
      <ul className="flex flex-col text-sm">
        <SidebarNavItem barColor="red" href="/app">
          <PiTimer size={22} className="mr-2 text-red-500" />
          {t("timer")}
          {runningTimeEntry.data && (
            <>
              ・<Duration startedAt={runningTimeEntry.data.startedAt} />
            </>
          )}
        </SidebarNavItem>
        <SidebarNavItem barColor="green" href="/app/calendar">
          <PiCalendarBlank size={22} className="mr-2 text-green-500" />
          {t("calendar")}
        </SidebarNavItem>
        <SidebarNavItem barColor="blue" href="/app/reports">
          <PiChartBar size={22} className="mr-2 text-green-500" />
          {t("reports")}
        </SidebarNavItem>
      </ul>
    </nav>
  );
};
