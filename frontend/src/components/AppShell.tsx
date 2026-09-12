import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sm_sidebar_collapsed") === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sm_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard Overview";
    if (path.startsWith("/materials") || path.startsWith("/study-materials")) return "Study Library";
    if (path.startsWith("/mock-tests")) return "Mock Examinations";
    if (path.startsWith("/progress")) return "Academic Progress";
    if (path.startsWith("/profile")) return "Student Profile";
    if (path.startsWith("/settings")) return "Account Settings";
    return "Sikamitra";
  };

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      to: "/materials",
      label: "Library & Materials",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
        </svg>
      ),
    },
    {
      to: "/mock-tests",
      label: "Mock Tests",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 11 3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      to: "/progress",
      label: "My Progress",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`modern-shell ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="mobile-backdrop" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`modern-sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        {/* Sidebar Brand Header */}
        <div className="sidebar-brand-box">
          <NavLink to="/dashboard" className="sidebar-brand-link" onClick={() => setIsMobileOpen(false)}>
            <div className="brand-badge">S</div>
            {!isCollapsed && (
              <div className="brand-text-col">
                <span className="brand-title">Sikamitra</span>
                <span className="brand-subtitle">AI Study Companion</span>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: isCollapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="sidebar-nav-list">
          <div className="sidebar-group-label">{!isCollapsed ? "STUDY WORKSPACE" : "•••"}</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `modern-nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-item-text">{item.label}</span>}
            </NavLink>
          ))}

          <div className="sidebar-group-label" style={{ marginTop: "1.5rem" }}>
            {!isCollapsed ? "PREFERENCES" : "•••"}
          </div>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `modern-nav-item ${isActive ? "active" : ""}`
            }
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? "Profile" : undefined}
          >
            <span className="nav-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            {!isCollapsed && <span className="nav-item-text">Profile</span>}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `modern-nav-item ${isActive ? "active" : ""}`
            }
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? "Settings" : undefined}
          >
            <span className="nav-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            {!isCollapsed && <span className="nav-item-text">Settings</span>}
          </NavLink>
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="user-mini-avatar">
              {user?.profile_image ? (
                <img src={user.profile_image} alt="" />
              ) : (
                user?.full_name?.charAt(0).toUpperCase() || "S"
              )}
            </div>
            {!isCollapsed && (
              <div className="user-mini-meta">
                <span className="user-mini-name">{user?.full_name || "Student"}</span>
                <span className="user-mini-role">Active Learner</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT VIEWPORT */}
      <div className="modern-viewport">
        {/* TOPBAR */}
        <header className="modern-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-hamburger"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open navigation"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="breadcrumb-box">
              <span className="breadcrumb-root">Home</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{getPageTitle()}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-actions">
              <NavLink to="/materials" className="quick-upload-pill">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span>Add Material</span>
              </NavLink>

              <div className="profile-dropdown-wrapper">
                <button
                  type="button"
                  className="profile-pill-trigger"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                >
                  <div className="pill-avatar">
                    {user?.profile_image ? (
                      <img src={user.profile_image} alt="" />
                    ) : (
                      user?.full_name?.charAt(0).toUpperCase() || "S"
                    )}
                  </div>
                  <span className="pill-username">{user?.full_name?.split(" ")[0] || "Account"}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {isProfileMenuOpen && (
                  <div className="profile-flyout-menu" onMouseLeave={() => setIsProfileMenuOpen(false)}>
                    <div className="flyout-header">
                      <strong>{user?.full_name || "Student"}</strong>
                      <span>{user?.email || "student@sikamitra.edu"}</span>
                    </div>
                    <div className="flyout-divider" />
                    <NavLink to="/profile" className="flyout-link" onClick={() => setIsProfileMenuOpen(false)}>
                      View Profile
                    </NavLink>
                    <NavLink to="/settings" className="flyout-link" onClick={() => setIsProfileMenuOpen(false)}>
                      Settings
                    </NavLink>
                    <div className="flyout-divider" />
                    <button type="button" className="flyout-link logout-link" onClick={handleLogout}>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY VIEW */}
        <main className="modern-main-content">
          <div className="modern-page-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
