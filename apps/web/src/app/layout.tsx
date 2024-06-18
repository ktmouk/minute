import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "minute",
};

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return children;
};

export default Layout;
