import "./globals.css";

export const metadata = {
  title: "minute",
};

export const dynamic = "force-dynamic";
export const fetchCache = "only-no-store";

const Layout = ({ children }: LayoutProps<"/">) => {
  return children;
};

export default Layout;
