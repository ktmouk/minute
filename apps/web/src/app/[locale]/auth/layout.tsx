import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <main className="flex justify-center items-center flex-col w-screen h-screen bg-gray-200">
      {children}
    </main>
  );
};

export default Layout;
