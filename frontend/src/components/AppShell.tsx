import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
            <div className="user-menu">

              <button
                type="button"
                className="user-account-link"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsProfileMenuOpen((current) => !current)}
              >
                <div className="user-avatar">
                {user?.profile_image ? (
                  <img src={user.profile_image} alt="" />
                ) : (
                  user?.full_name?.charAt(0).toUpperCase() || "U"
                )}
                </div>

                <div className="user-info">
                  <span className="user-name">
                    {user?.full_name || "Student"}
                  </span>

                  <span className="user-label">
                    Account
                  </span>
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="profile-menu" role="menu">
                  <NavLink
                    to="/profile"
                    className="profile-menu-item"
                    role="menuitem"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <strong>Profile</strong>
                    <span>View your account</span>
                  </NavLink>

                  <NavLink
                    to="/settings"
                    className="profile-menu-item"
                    role="menuitem"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <strong>Settings</strong>
                    <span>Manage your account</span>
                  </NavLink>

                  <button
                    type="button"
                    className="profile-menu-item profile-menu-logout"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <strong>Log out</strong>
                    <span>End this session</span>
                  </button>
                </div>
              )}

              <span
                className="user-menu-button"
                aria-hidden="true"
                title={isProfileMenuOpen ? "Close account menu" : "Open account menu"}
              >
                ···
              </span>

            </div>

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