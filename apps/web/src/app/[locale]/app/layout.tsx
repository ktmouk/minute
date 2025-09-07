import { Sidebar } from "../_components/Sidebar";

const Layout = ({ children }: LayoutProps<"/[locale]/app">) => {
  return (
    <div className="flex">
      <h1 className="sr-only">minute</h1>
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
