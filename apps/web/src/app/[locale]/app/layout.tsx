import type { ReactNode } from "react";
import { Sidebar } from "../_components/Sidebar";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="flex">
      <h1 className="sr-only">minute</h1>
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
