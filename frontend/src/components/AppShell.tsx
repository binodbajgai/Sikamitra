import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="top-navbar">
        <div className="navbar-inner">

          {/* BRAND */}
          <NavLink to="/dashboard" className="brand">
            <div className="brand-mark">
              S
            </div>

            <div className="brand-text">
              <span className="brand-name">
                Sikamitra
              </span>

              <span className="brand-tagline">
                Your AI study companion
              </span>
            </div>
          </NavLink>


          {/* NAVIGATION */}
          <nav className="main-navigation">

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              Overview
            </NavLink>

            <NavLink
              to="/materials"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              Library
            </NavLink>

            <NavLink
              to="/mock-tests"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              Mock Tests
            </NavLink>

            <NavLink
              to="/progress"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              Progress
            </NavLink>

          </nav>


          {/* RIGHT SIDE */}
          <div className="navbar-actions">

            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
            >
              <span>•</span>
            </button>

            <div className="navbar-divider" />


            <NavLink to="/profile" className="user-menu">

              <div className="user-avatar">
                {user?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="user-info">
                <span className="user-name">
                  {user?.full_name || "Student"}
                </span>

                <span className="user-label">
                  Account
                </span>
              </div>

              <button
                type="button"
                className="user-menu-button"
                onClick={handleLogout}
                title="Log out"
              >
                ↗
              </button>

            </NavLink>

          </div>

        </div>
      </header>


      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

export default AppShell;