const Layout = ({ children }: LayoutProps<"/[locale]/auth">) => {
  return (
    <main className="flex justify-center items-center flex-col w-screen h-screen bg-gray-200">
      {children}
    </main>
  );
};

export default Layout;
