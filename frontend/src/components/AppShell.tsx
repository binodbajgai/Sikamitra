import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Library,
  FileQuestion,
  TrendingUp,
  User,
  Settings as SettingsIcon,
  LogOut,
  MoreHorizontal,
} from "lucide-react";

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
              <LayoutDashboard size={18} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Overview
            </NavLink>

            <NavLink
              to="/materials"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Library size={18} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Library
            </NavLink>

            <NavLink
              to="/mock-tests"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <FileQuestion size={18} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Mock Tests
            </NavLink>

            <NavLink
              to="/progress"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <TrendingUp size={18} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Progress
            </NavLink>

          </nav>


          {/* RIGHT SIDE */}
          <div className="navbar-actions">
            <div className="user-menu">

              <NavLink
                to="/profile"
                className="user-account-link"
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
              </NavLink>

              {isProfileMenuOpen && (
                <div className="profile-menu" role="menu">
                  <NavLink
                    to="/profile"
                    className="profile-menu-item"
                    role="menuitem"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span className="profile-menu-icon" aria-hidden="true">
                      <User size={16} strokeWidth={1.9} />
                    </span>
                    <span className="profile-menu-copy">
                      <strong>Profile</strong>
                      <small>View and edit your account</small>
                    </span>
                  </NavLink>

                  <NavLink
                    to="/settings"
                    className="profile-menu-item"
                    role="menuitem"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span className="profile-menu-icon" aria-hidden="true">
                      <SettingsIcon size={16} strokeWidth={1.9} />
                    </span>
                    <span className="profile-menu-copy">
                      <strong>Settings</strong>
                      <small>Manage your preferences</small>
                    </span>
                  </NavLink>

                  <button
                    type="button"
                    className="profile-menu-item profile-menu-logout"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <span className="profile-menu-icon" aria-hidden="true">
                      <LogOut size={16} strokeWidth={1.9} />
                    </span>
                    <span className="profile-menu-copy">
                      <strong>Log out</strong>
                      <small>Sign out of this device</small>
                    </span>
                  </button>
                </div>
              )}

              <button
                type="button"
                className="user-menu-button"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                aria-label={isProfileMenuOpen ? "Close account menu" : "Open account menu"}
                onClick={() => setIsProfileMenuOpen((current) => !current)}
                title={isProfileMenuOpen ? "Close account menu" : "Open account menu"}
              >
                <MoreHorizontal size={18} />
              </button>

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
