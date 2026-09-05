import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getMockTestAttemptHistory, getMockTests } from "../api/mockTests";
import { getStudyMaterials, type StudyMaterial } from "../api/studyMaterials";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] || "Student";
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [mockTestCount, setMockTestCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    async function loadActivity() {
      try {
        setLoadingActivity(true);
        setActivityError("");
        const [materialsData, tests] = await Promise.all([
          getStudyMaterials(),
          getMockTests(),
        ]);
        const histories = await Promise.all(
          tests.map((test) => getMockTestAttemptHistory(test.id))
        );
        setMaterials(materialsData);
        setMockTestCount(tests.length);
        setAttemptCount(
          histories.flat().filter((attempt) => attempt.submitted_at).length
        );
      } catch (error) {
        console.error(error);
        setActivityError("Unable to load your study activity.");
      } finally {
        setLoadingActivity(false);
      }
    }

    void loadActivity();
  }, []);

  const recentMaterials = materials.slice(0, 3);

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
                {loadingActivity ? "..." : materials.length}
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
                {loadingActivity ? "..." : mockTestCount}
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
                {loadingActivity ? "..." : attemptCount}
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


          {activityError && (
            <p className="dashboard-activity-error">{activityError}</p>
          )}

          {recentMaterials.length > 0 ? (
            <div className="recent-material-list">
              {recentMaterials.map((material) => (
                <NavLink
                  to={`/study-materials/${material.id}`}
                  className="recent-material-item"
                  key={material.id}
                >
                  <span className="recent-material-icon">{material.source_type}</span>
                  <span className="recent-material-info">
                    <strong>{material.title}</strong>
                    <small>{material.subject_name || "Unsorted material"}</small>
                  </span>
                  <span className="recent-material-arrow">→</span>
                </NavLink>
              ))}
            </div>
          ) : (
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
          )}

        </section>

    </div>
  );
}

export default Dashboard;