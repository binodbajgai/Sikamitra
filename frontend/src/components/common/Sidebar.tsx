import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";

interface SidebarProps {
  isCollapsed?: boolean;
  toggleSidebar?: () => void;
}

function Sidebar({ isCollapsed = false, toggleSidebar }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isStudyMaterialsRoute =
    location.pathname === "/study-materials" ||
    location.pathname.startsWith("/study-materials/") ||
    location.pathname === "/materials" ||
    location.pathname.startsWith("/materials/");

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
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
          
          {toggleSidebar && (
            <button 
              className="sidebar-toggle" 
              onClick={toggleSidebar} 
              title="Toggle Sidebar"
            >
              {isCollapsed ? "»" : "«"}
            </button>
          )}
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
            to="/study-materials"
            className={
              isStudyMaterialsRoute
                ? "sidebar-nav-item active"
                : "sidebar-nav-item"
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
        <div className="sidebar-profile-simplified">
          <strong>
            {user?.full_name || "Student"}
          </strong>
          <span>
            {user?.university || "Sikamitra Student"}
          </span>
        </div>

        <button
          type="button"
          className="sidebar-logout-simplified"
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