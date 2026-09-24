import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getMockTestAttemptHistory, getMockTests } from "../api/mockTests";
import { getStudyMaterials, type StudyMaterial } from "../api/studyMaterials";
import { getSubjects, type Subject } from "../api/subjects";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Plus,
  Folder,
} from "lucide-react";

function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] || "Student";
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mockTestCount, setMockTestCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    async function loadActivity() {
      try {
        setLoadingActivity(true);
        setActivityError("");
        const [materialsData, subjectsData, tests] = await Promise.all([
          getStudyMaterials(),
          getSubjects(),
          getMockTests(),
        ]);
        const histories = await Promise.all(
          tests.map((test) => getMockTestAttemptHistory(test.id))
        );
        setMaterials(materialsData);
        setSubjects(subjectsData);
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

  const recentSubjects = subjects.slice(0, 3);

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
              <Sparkles size={16} color="#6366f1" />

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
                <BookOpen size={24} />
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
                <ArrowRight size={20} />
              </span>

            </NavLink>


            <NavLink
              to="/mock-tests"
              className="action-card"
            >

              <div className="action-icon">
                <CheckCircle size={24} />
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
                <ArrowRight size={20} />
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
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              View library <ArrowRight size={14} />
            </NavLink>

          </div>


          {activityError && (
            <p className="dashboard-activity-error">{activityError}</p>
          )}

          {recentSubjects.length > 0 ? (
            <div className="recent-material-list">
              {recentSubjects.map((subject) => {
                const count = materials.filter(
                  (material) => material.subject_id === subject.id
                ).length;

                return (
                  <NavLink
                    to={`/materials/subjects/${subject.id}`}
                    className="recent-material-item"
                    key={subject.id}
                  >
                    <span
                      className="recent-material-icon"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Folder size={18} />
                    </span>
                    <span className="recent-material-info">
                      <strong>{subject.name}</strong>
                      <small>
                        {count} {count === 1 ? "material" : "materials"}
                        {subject.description ? ` · ${subject.description}` : ""}
                      </small>
                    </span>
                    <span className="recent-material-arrow">
                      <ArrowRight size={16} />
                    </span>
                  </NavLink>
                );
              })}
            </div>
          ) : (
          <div className="recent-empty">

            <div className="recent-empty-mark">
              <Plus size={24} />
            </div>

            <div>

              <h3>
                Your study space is ready.
              </h3>

              <p>
                Create your first subject to organize your study
                materials, notes, and practice tests.
              </p>

            </div>

            <NavLink
              to="/materials"
              className="text-button"
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              Open library <ArrowRight size={14} />
            </NavLink>

          </div>
          )}

        </section>

    </div>
  );
}

export default Dashboard;