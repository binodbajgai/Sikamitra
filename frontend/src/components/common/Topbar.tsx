import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";

function Topbar() {
  const location = useLocation();
  const { user } = useAuth();

  const isStudyMaterialsPage =
    location.pathname === "/study-materials" ||
    location.pathname.startsWith("/study-materials/") ||
    location.pathname === "/materials" ||
    location.pathname.startsWith("/materials/");

  function getPageTitle() {
    if (location.pathname === "/dashboard") {
      return "Dashboard";
    }

    if (isStudyMaterialsPage) {
      return "Study Materials";
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

    if (isStudyMaterialsPage) {
      return "";
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
          to="/study-materials"
          state={{ openUpload: true }}
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
