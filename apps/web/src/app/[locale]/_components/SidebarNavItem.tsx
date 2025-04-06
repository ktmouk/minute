import type { ReactNode } from "react";
import { tv } from "tailwind-variants";
import { Link, usePathname } from "../../../i18n/navigation";

const barStyle = tv({
  base: "my-2 mr-4 block h-6 w-1 rounded-r-sm",
  variants: {
    barColor: {
      red: "bg-red-500",
      green: "bg-green-500",
      blue: "bg-blue-500",
    },
    isCurrent: {
      false: "bg-transparent",
    },
  },
});

type Props = {
  href: string;
  barColor: "red" | "green" | "blue";
  children: ReactNode;
};

export const SidebarNavItem = ({ href, barColor, children }: Props) => {
  const pathname = usePathname();
  const isCurrent = pathname === href;

  return (
    <li>
      <Link
        className="flex w-full items-center outline-none pr-4 hover:bg-gray-200 focus:bg-gray-200"
        aria-current={isCurrent ? "page" : undefined}
        href={href}
      >
        <span className={barStyle({ barColor, isCurrent })} />
        {children}
      </Link>
    </li>
  );
};
