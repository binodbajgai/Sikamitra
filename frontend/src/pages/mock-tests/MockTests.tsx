import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getStudyMaterials,
  type StudyMaterial,
} from "../../api/studyMaterials.ts";

type Difficulty = "Easy" | "Medium" | "Hard";

function MockTests() {
  const navigate = useNavigate();

  const [materials, setMaterials] = useState<
    StudyMaterial[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] =
    useState(false);

  const [selectedMaterial, setSelectedMaterial] =
    useState("");

  const [questionCount, setQuestionCount] =
    useState("20");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Medium");

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
            "Unable to load your study materials."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadMaterials();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedMaterialName = useMemo(() => {
    return (
      materials.find(
        (material) =>
          String(material.id) === selectedMaterial
      )?.title || ""
    );
  }, [materials, selectedMaterial]);

  function handleCreateTest() {
    if (!selectedMaterial) {
      setError(
        "Choose a study material before creating a test."
      );

      return;
    }

    setError("");

    navigate("/mock-tests/take");
  }

  return (
    <div className="mock-tests-page">
      <div className="mock-tests-container">

        {/* Header */}
        <header className="mock-tests-header">
          <div>
            <p className="mock-tests-kicker">
              Practice
            </p>

            <h1>Mock tests</h1>

            <p className="mock-tests-description">
              Turn your study material into focused
              practice sessions and test what you
              actually remember.
            </p>
          </div>

          <button
            type="button"
            className="mock-tests-primary-button"
            onClick={() => {
              setError("");
              setShowCreate(true);
            }}
          >
            <span>+</span>
            Create test
          </button>
        </header>


        {/* Overview */}
        <section className="mock-tests-overview">
          <div className="mock-tests-overview-item">
            <span>Available materials</span>

            <strong>
              {loading
                ? "—"
                : materials.length}
            </strong>
          </div>

          <div className="mock-tests-overview-item">
            <span>Recommended length</span>

            <strong>20</strong>

            <small>questions</small>
          </div>

          <div className="mock-tests-overview-item">
            <span>Practice mode</span>

            <strong>Focused</strong>

            <small>active recall</small>
          </div>
        </section>


        {/* Error */}
        {error && (
          <div className="mock-tests-error">
            {error}
          </div>
        )}


        {/* Create panel */}
        {showCreate && (
          <section className="mock-test-create-panel">

            <div className="mock-test-create-header">
              <div>
                <p className="mock-tests-section-kicker">
                  New test
                </p>

                <h2>
                  Set up your practice session
                </h2>

                <p>
                  Choose what you want to practice
                  and how challenging the test should
                  feel.
                </p>
              </div>

              <button
                type="button"
                className="mock-test-close"
                onClick={() =>
                  setShowCreate(false)
                }
                aria-label="Close"
              >
                ×
              </button>
            </div>


            <div className="mock-test-form">

              {/* Material */}
              <label className="mock-test-field">
                <span>Study material</span>

                <select
                  value={selectedMaterial}
                  onChange={(event) => {
                    setSelectedMaterial(
                      event.target.value
                    );

                    setError("");
                  }}
                  disabled={loading}
                >
                  <option value="">
                    {loading
                      ? "Loading materials..."
                      : "Choose a material"}
                  </option>

                  {materials.map((material) => (
                    <option
                      key={material.id}
                      value={material.id}
                    >
                      {material.title}
                    </option>
                  ))}
                </select>

                <small>
                  {selectedMaterialName ||
                    "Questions will be generated from this material."}
                </small>
              </label>


              {/* Question count */}
              <label className="mock-test-field">
                <span>Questions</span>

                <select
                  value={questionCount}
                  onChange={(event) =>
                    setQuestionCount(
                      event.target.value
                    )
                  }
                >
                  <option value="10">
                    10 questions
                  </option>

                  <option value="20">
                    20 questions
                  </option>

                  <option value="30">
                    30 questions
                  </option>

                  <option value="40">
                    40 questions
                  </option>

                  <option value="50">
                    50 questions
                  </option>
                </select>

                <small>
                  A shorter test is useful for quick
                  revision.
                </small>
              </label>


              {/* Difficulty */}
              <div className="mock-test-field">
                <span>Difficulty</span>

                <div className="difficulty-options">
                  {(
                    [
                      "Easy",
                      "Medium",
                      "Hard",
                    ] as Difficulty[]
                  ).map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={
                        difficulty === level
                          ? "difficulty-option active"
                          : "difficulty-option"
                      }
                      onClick={() =>
                        setDifficulty(level)
                      }
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <small>
                  Choose the level that matches
                  your revision goal.
                </small>
              </div>
            </div>


            {/* Footer */}
            <div className="mock-test-create-footer">
              <span>
                {selectedMaterialName
                  ? `${questionCount} questions · ${difficulty}`
                  : "Select a material to continue"}
              </span>

              <button
                type="button"
                className="mock-tests-primary-button"
                disabled={
                  loading ||
                  !selectedMaterial
                }
                onClick={handleCreateTest}
              >
                Start test
                <span>→</span>
              </button>
            </div>

          </section>
        )}


        {/* Intro */}
        {!showCreate && (
          <section className="mock-tests-intro-card">

            <div className="mock-tests-intro-mark">
              ✓
            </div>

            <div>
              <p className="mock-tests-section-kicker">
                Start practicing
              </p>

              <h2>
                Build a test from what you're
                studying.
              </h2>

              <p>
                Select one of your uploaded materials,
                choose a question count, and set the
                difficulty. Your test workspace will
                appear here.
              </p>
            </div>

            <button
              type="button"
              className="mock-tests-outline-button"
              onClick={() => {
                setError("");
                setShowCreate(true);
              }}
            >
              Create your first test
            </button>

          </section>
        )}


        {/* Test history */}
        <section className="mock-tests-library">

          <div className="mock-tests-section-header">
            <div>
              <p className="mock-tests-section-kicker">
                Your practice
              </p>

              <h2>Test history</h2>
            </div>
          </div>

          <div className="mock-tests-empty">

            <div className="mock-tests-empty-mark">
              —
            </div>

            <h3>
              No test attempts yet
            </h3>

            <p>
              Once you complete a mock test, your
              attempts and scores will appear here.
            </p>

            <Link
              to="/materials"
              className="mock-tests-text-link"
            >
              Browse study materials →
            </Link>

          </div>

        </section>

      </div>
    </div>
  );
}

export default MockTests;