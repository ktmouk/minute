import { useTranslations } from "next-intl";
import { PiTimer, PiCalendarBlank, PiChartBar } from "react-icons/pi";
import { tv } from "tailwind-variants";
import { usePathname, Link } from "../../../navigation";

const iconStyle = tv({
  base: "mr-2",
  variants: {
    href: {
      "/app": "text-red-500",
      "/app/calendar": "text-green-500",
      "/app/reports": "text-blue-500",
    },
  },
});

const barStyle = tv({
  base: "my-2 mr-4 block h-6 w-1 rounded-r-sm",
  variants: {
    href: {
      "/app": "bg-red-500",
      "/app/calendar": "bg-green-500",
      "/app/reports": "bg-blue-500",
    },
    isCurrent: {
      false: "bg-transparent",
    },
  },
});

const menuItems = [
  {
    key: "timer",
    href: "/app",
    icon: <PiTimer size={22} />,
  },
  {
    key: "calendar",
    href: "/app/calendar",
    icon: <PiCalendarBlank size={22} />,
  },
  {
    key: "reports",
    href: "/app/reports",
    icon: <PiChartBar size={22} />,
  },
] as const;

export const SidebarNav = () => {
  const t = useTranslations("components.SidebarNav");
  const pathname = usePathname();

  return (
    <nav>
      <ul className="flex flex-col text-sm">
        {menuItems.map(({ key, icon, href }) => {
          const isCurrent = pathname === href;
          return (
            <li key={href}>
              <Link
                className="flex w-full items-center outline-none hover:bg-gray-200 focus:bg-gray-200"
                aria-current={isCurrent ? "page" : undefined}
                href={href}
              >
                <span className={barStyle({ href, isCurrent })} />
                <span className={iconStyle({ href })}>{icon}</span>
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
