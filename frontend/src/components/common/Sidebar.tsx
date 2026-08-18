import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";

function Sidebar() {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) {
      return "S";
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            S
          </div>

          <div className="sidebar-brand-text">
            <h1>Sikamitra</h1>
            <p>AI Study Companion</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-navigation">
          <p className="sidebar-section-label">
            Workspace
          </p>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="sidebar-nav-icon">
              ◫
            </span>

            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/materials"
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="sidebar-nav-icon">
              ▤
            </span>

            <span>Study Materials</span>
          </NavLink>

          <NavLink
            to="/mock-tests"
            className={({ isActive }) =>
              `sidebar-nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="sidebar-nav-icon">
              ✓
            </span>

            <span>Mock Tests</span>
          </NavLink>
        </nav>
      </div>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {getInitials(user?.full_name)}
          </div>

          <div className="sidebar-profile-info">
            <strong>
              {user?.full_name || "Student"}
            </strong>

            <span>
              {user?.university || "Sikamitra Student"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={logout}
        >
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;