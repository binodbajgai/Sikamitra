import { NavLink } from "react-router-dom";

function Dashboard() {
  const firstName = "Student";

  return (
    <div className="dashboard-page">

        {/* HERO */}
        <section className="dashboard-hero">

          <div className="dashboard-hero-content">

            <span className="page-kicker">
              YOUR STUDY SPACE
            </span>

            <h1>
              Good to see you,{" "}
              <span>{firstName}.</span>
            </h1>

            <p>
              Pick up where you left off or start something
              new today.
            </p>

          </div>


          <div className="hero-decoration">

            <div className="hero-circle hero-circle-one" />

            <div className="hero-circle hero-circle-two" />

            <div className="hero-note">
              <span>✦</span>

              <strong>
                Study smarter
              </strong>

              <small>
                with Sikamitra AI
              </small>
            </div>

          </div>

        </section>


        {/* QUICK ACTIONS */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                GET STARTED
              </span>

              <h2>
                What would you like to do?
              </h2>
            </div>

          </div>


          <div className="quick-actions">

            <NavLink
              to="/materials"
              className="action-card action-card-primary"
            >

              <div className="action-icon">
                +
              </div>

              <div className="action-content">

                <span className="action-eyebrow">
                  LIBRARY
                </span>

                <h3>
                  Study materials
                </h3>

                <p>
                  Upload notes, chapters and documents
                  for AI-powered study tools.
                </p>

              </div>

              <span className="action-arrow">
                →
              </span>

            </NavLink>


            <NavLink
              to="/mock-tests"
              className="action-card"
            >

              <div className="action-icon">
                ✓
              </div>

              <div className="action-content">

                <span className="action-eyebrow">
                  PRACTICE
                </span>

                <h3>
                  Mock tests
                </h3>

                <p>
                  Test yourself with questions generated
                  from your study materials.
                </p>

              </div>

              <span className="action-arrow">
                →
              </span>

            </NavLink>

          </div>

        </section>


        {/* OVERVIEW */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                OVERVIEW
              </span>

              <h2>
                Your study activity
              </h2>
            </div>

          </div>


          <div className="overview-grid">

            <div className="overview-card">

              <span className="overview-number">
                —
              </span>

              <div>
                <span className="overview-label">
                  MATERIALS
                </span>

                <p>
                  Study documents
                </p>
              </div>

            </div>


            <div className="overview-card">

              <span className="overview-number">
                —
              </span>

              <div>
                <span className="overview-label">
                  MOCK TESTS
                </span>

                <p>
                  Tests created
                </p>
              </div>

            </div>


            <div className="overview-card">

              <span className="overview-number">
                —
              </span>

              <div>
                <span className="overview-label">
                  ATTEMPTS
                </span>

                <p>
                  Tests completed
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* RECENT ACTIVITY */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                RECENT
              </span>

              <h2>
                Continue studying
              </h2>
            </div>

            <NavLink
              to="/materials"
              className="section-link"
            >
              View library →
            </NavLink>

          </div>


          <div className="recent-empty">

            <div className="recent-empty-mark">
              +
            </div>

            <div>

              <h3>
                Your study space is ready.
              </h3>

              <p>
                Upload your first material and Sikamitra
                will turn it into summaries, important
                points and practice questions.
              </p>

            </div>

            <NavLink
              to="/materials"
              className="text-button"
            >
              Open library →
            </NavLink>

          </div>

        </section>

    </div>
  );
}

export default Dashboard;