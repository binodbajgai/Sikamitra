import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>

          <div>
            <h2>Sikamitra</h2>
            <span>Study companion</span>
          </div>
        </div>

        <nav className="dashboard-nav">
          <NavLink to="/dashboard">
            <span>01</span>
            Overview
          </NavLink>

          <NavLink to="/materials">
            <span>02</span>
            Materials
          </NavLink>

          <NavLink to="/mock-tests">
            <span>03</span>
            Mock tests
          </NavLink>

          <NavLink to="/attempts">
            <span>04</span>
            Attempts
          </NavLink>

          <NavLink to="/profile">
            <span>05</span>
            Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="account">
            <div className="account-avatar">
              {initials}
            </div>

            <div className="account-details">
              <strong>{user?.full_name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="logout-button"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="eyebrow">
              Overview
            </span>

            <h1>
              Good to see you,{" "}
              {user?.full_name?.split(" ")[0] || "there"}.
            </h1>

            <p>
              Keep your preparation moving one session at a time.
            </p>
          </div>

          <div className="header-avatar">
            {initials}
          </div>
        </header>

        <section className="dashboard-intro">
          <div>
            <span className="eyebrow">
              Start here
            </span>

            <h2>
              What would you like to work on?
            </h2>

            <p>
              Use your study materials to build mock
              tests, then review your performance after
              each attempt.
            </p>
          </div>

          <NavLink
            to="/mock-tests"
            className="dark-action"
          >
            Open mock tests
            <span>→</span>
          </NavLink>
        </section>

        <section className="dashboard-columns">
          <div className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  Your library
                </span>

                <h2>Study materials</h2>
              </div>

              <NavLink to="/materials">
                View →
              </NavLink>
            </div>

            <div className="panel-empty">
              <div className="empty-number">
                01
              </div>

              <h3>
                Your materials live here.
              </h3>

              <p>
                Upload notes or documents and use them
                as the foundation for your mock tests.
              </p>

              <NavLink to="/materials">
                Open materials →
              </NavLink>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  Practice
                </span>

                <h2>Mock tests</h2>
              </div>

              <NavLink to="/mock-tests">
                View →
              </NavLink>
            </div>

            <div className="panel-empty">
              <div className="empty-number">
                02
              </div>

              <h3>
                Test what you know.
              </h3>

              <p>
                Create a mock test from one of your
                study materials and track your attempts.
              </p>

              <NavLink to="/mock-tests">
                View mock tests →
              </NavLink>
            </div>
          </div>
        </section>

        <section className="recent-section">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                History
              </span>

              <h2>Recent attempts</h2>
            </div>

            <NavLink to="/attempts">
              View all →
            </NavLink>
          </div>

          <div className="recent-empty">
            <span>—</span>

            <div>
              <h3>
                No completed attempts yet.
              </h3>

              <p>
                Your mock-test results will appear here
                once you complete your first test.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;