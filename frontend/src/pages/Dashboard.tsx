import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext.tsx";
import {
  getStudyMaterials,
  type StudyMaterial,
} from "../api/studyMaterials.ts";

function Dashboard() {
  const { user } = useAuth();

  const [materials, setMaterials] = useState<
    StudyMaterial[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadMaterials() {
      try {
        setLoading(true);
        setError("");

        const data = await getStudyMaterials();

        if (mounted) {
          setMaterials(data);
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            "We couldn't load your study materials."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMaterials();

    return () => {
      mounted = false;
    };
  }, []);

  const recentMaterials = useMemo(() => {
    return [...materials]
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() -
          new Date(a.updated_at).getTime()
      )
      .slice(0, 4);
  }, [materials]);

  const firstName =
    user?.full_name?.trim().split(/\s+/)[0] ||
    "Student";

  function formatDate(date: string) {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "";
    }

    return value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* Header */}
        <header className="dashboard-header">
          <div>
            <p className="dashboard-kicker">
              Your study workspace
            </p>

            <h1>
              Good morning, {firstName}.
            </h1>

            <p className="dashboard-intro">
              Keep your materials organized and
              continue learning from where you left off.
            </p>
          </div>

          <Link
            to="/materials"
            className="dashboard-primary-action"
          >
            <span>+</span>
            Add material
          </Link>
        </header>


        {/* Overview */}
        <section className="dashboard-overview">

          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">
              Study materials
            </span>

            <strong className="dashboard-stat-value">
              {loading ? "—" : materials.length}
            </strong>

            <span className="dashboard-stat-note">
              In your library
            </span>
          </div>


          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">
              AI workspace
            </span>

            <strong className="dashboard-stat-value">
              Ready
            </strong>

            <span className="dashboard-stat-note">
              Generate summaries and questions
            </span>
          </div>


          <div className="dashboard-stat-card">
            <span className="dashboard-stat-label">
              Mock tests
            </span>

            <strong className="dashboard-stat-value">
              —
            </strong>

            <span className="dashboard-stat-note">
              Practice area coming next
            </span>
          </div>

        </section>


        {/* Main grid */}
        <section className="dashboard-main-grid">

          {/* Recent materials */}
          <div className="dashboard-section">

            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-section-kicker">
                  Library
                </p>

                <h2>Recent study materials</h2>
              </div>

              <Link
                to="/materials"
                className="dashboard-text-link"
              >
                View all
              </Link>
            </div>


            {error && (
              <div className="dashboard-message dashboard-message-error">
                {error}
              </div>
            )}


            {!loading &&
              !error &&
              recentMaterials.length === 0 && (
                <div className="dashboard-empty-state">
                  <div className="dashboard-empty-mark">
                    +
                  </div>

                  <h3>
                    Your library is empty
                  </h3>

                  <p>
                    Upload your first study material
                    and start building your AI-powered
                    study workspace.
                  </p>

                  <Link
                    to="/materials"
                    className="dashboard-secondary-action"
                  >
                    Upload material
                  </Link>
                </div>
              )}


            {!loading &&
              !error &&
              recentMaterials.length > 0 && (
                <div className="dashboard-material-list">
                  {recentMaterials.map((material) => (
                    <Link
                      key={material.id}
                      to={`/materials/${material.id}`}
                      className="dashboard-material-item"
                    >
                      <div className="dashboard-material-icon">
                        {material.file_name
                          ?.split(".")
                          .pop()
                          ?.toUpperCase()
                          .slice(0, 4) || "DOC"}
                      </div>

                      <div className="dashboard-material-info">
                        <h3>{material.title}</h3>

                        <p>
                          {material.source_type ||
                            "Study material"}
                          {" · "}
                          Updated{" "}
                          {formatDate(
                            material.updated_at
                          )}
                        </p>
                      </div>

                      <span className="dashboard-material-arrow">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              )}


            {loading && (
              <div className="dashboard-material-list">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="dashboard-material-skeleton"
                  >
                    <div className="skeleton-box" />

                    <div className="skeleton-lines">
                      <span />
                      <span />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>


          {/* Quick actions */}
          <aside className="dashboard-section dashboard-actions-section">

            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-section-kicker">
                  Quick access
                </p>

                <h2>Start studying</h2>
              </div>
            </div>


            <div className="dashboard-actions">

              <Link
                to="/materials"
                className="dashboard-action-card"
              >
                <div className="dashboard-action-icon">
                  ↑
                </div>

                <div>
                  <h3>Upload material</h3>

                  <p>
                    Add a PDF or study document to
                    your library.
                  </p>
                </div>

                <span>→</span>
              </Link>


              {recentMaterials.length > 0 ? (
                <Link
                  to={`/materials/${recentMaterials[0].id}`}
                  className="dashboard-action-card"
                >
                  <div className="dashboard-action-icon">
                    ◇
                  </div>

                  <div>
                    <h3>Continue studying</h3>

                    <p>
                      Open your most recently updated
                      material.
                    </p>
                  </div>

                  <span>→</span>
                </Link>
              ) : (
                <div className="dashboard-action-card dashboard-action-card-muted">
                  <div className="dashboard-action-icon">
                    ✓
                  </div>

                  <div>
                    <h3>Mock tests</h3>

                    <p>
                      Practice tests will be available
                      here as we expand your workspace.
                    </p>
                  </div>

                  <span>—</span>
                </div>
              )}

            </div>

          </aside>

        </section>


        {/* Bottom feature strip */}
        <section className="dashboard-feature-strip">

          <div>
            <p className="dashboard-section-kicker">
              Sikamitra
            </p>

            <h2>
              One place for your study material,
              practice, and revision.
            </h2>
          </div>

          <div className="dashboard-feature-points">
            <span>
              <b>01</b>
              Organize materials
            </span>

            <span>
              <b>02</b>
              Generate AI study content
            </span>

            <span>
              <b>03</b>
              Practice with mock tests
            </span>
          </div>

        </section>

      </div>
    </div>
  );
}

export default Dashboard;