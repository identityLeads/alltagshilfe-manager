import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageHeaderProvider } from "./PageHeaderContext";

export function Layout() {
  return (
    <PageHeaderProvider>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontSize: 14 }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#F4F6F5" }}>
          <Topbar />
          <main style={{ flex: 1, overflowY: "auto", padding: "26px 28px 40px 28px" }}>
            <Outlet />
          </main>
        </div>
      </div>
    </PageHeaderProvider>
  );
}
