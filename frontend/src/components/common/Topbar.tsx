import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";

function Topbar() {
  const location = useLocation();
  const { user } = useAuth();

  function getPageTitle() {
    if (location.pathname === "/dashboard") {
      return "Dashboard";
    }

    if (location.pathname === "/materials") {
      return "Study Materials";
    }

    if (
      location.pathname.startsWith(
        "/materials/"
      )
    ) {
      return "Material";
    }

    if (
      location.pathname.startsWith(
        "/mock-tests"
      )
    ) {
      return "Mock Tests";
    }

    return "Sikamitra";
  }

  function getPageDescription() {
    if (location.pathname === "/dashboard") {
      return "Your study workspace";
    }

    if (location.pathname === "/materials") {
      return "";
    }

    if (
      location.pathname.startsWith(
        "/materials/"
      )
    ) {
      return "Review and study your material";
    }

    if (
      location.pathname.startsWith(
        "/mock-tests"
      )
    ) {
      return "Practice and test your knowledge";
    }

    return "AI Study Companion";
  }

  const title = getPageTitle();
  const description = getPageDescription();

  const initials =
    user?.full_name
      ?.trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "S";

  return (
    <header className="topbar">
      <div className="topbar-page-info">
        {description && <p>{description}</p>}
        <h2>{title}</h2>
      </div>

      <div className="topbar-actions">
        <Link
          to="/materials"
          className="topbar-add-button"
        >
          <span>+</span>
          Add material
        </Link>

        <div className="topbar-profile">
          <div className="topbar-avatar">
            {initials}
          </div>

          <div className="topbar-user">
            <strong>
              {user?.full_name || "Student"}
            </strong>

            <span>
              {user?.university || "Student"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
