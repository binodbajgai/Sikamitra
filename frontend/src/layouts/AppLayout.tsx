import { Outlet } from "react-router-dom";

import Sidebar from "../components/common/Sidebar.tsx";
import Topbar from "../components/common/Topbar.tsx";

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;