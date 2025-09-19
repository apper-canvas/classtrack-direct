import Sidebar from "@/components/organisms/Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;