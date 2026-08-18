import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import type { Subject } from "../../types/subjects.ts";

import {
  getMaterialSubjectAssignments,
  getSubjects,
} from "../../utils/subjects.ts";

type Difficulty =
  | "Easy"
  | "Medium"
  | "Hard";

function MockTests() {
  const navigate = useNavigate();

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [assignments, setAssignments] =
    useState<Record<string, string>>({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showCreate, setShowCreate] =
    useState(false);

  const [selectedSubject, setSelectedSubject] =
    useState("");

  const [questionCount, setQuestionCount] =
    useState("20");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Medium");

  /*
   * Load locally stored subjects and
   * material → subject assignments.
   */
  useEffect(() => {
    try {
      setSubjects(getSubjects());

      setAssignments(
        getMaterialSubjectAssignments()
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load your subjects."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Currently this counts how many materials
   * belong to the selected subject.
   *
   * Later the same subject will provide the
   * question bank for the mock test.
   */
  const selectedSubjectMaterialCount =
    useMemo(() => {
      if (!selectedSubject) {
        return 0;
      }

      return Object.values(
        assignments
      ).filter(
        (subjectId) =>
          subjectId === selectedSubject
      ).length;
    }, [
      assignments,
      selectedSubject,
    ]);

  const selectedSubjectName =
    useMemo(() => {
      return (
        subjects.find(
          (subject) =>
            subject.id === selectedSubject
        )?.name || ""
      );
    }, [
      subjects,
      selectedSubject,
    ]);

  function handleCreateTest() {
    if (!selectedSubject) {
      setError(
        "Choose a subject before creating a test."
      );

      return;
    }

    setError("");

    /*
     * Frontend-only navigation for now.
     *
     * Later we will pass the actual backend
     * mock-test ID here.
     */
    navigate("/mock-tests/take");
  }

  return (
    <div className="mock-tests-page">
      <div className="mock-tests-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mock-tests-header">
          <div>
            <p className="mock-tests-kicker">
              Practice
            </p>

            <h1>
              Mock tests
            </h1>

            <p className="mock-tests-description">
              Practice an entire subject instead of
              preparing from individual files. Your
              subject will become the source for your
              future question bank.
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


        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section className="mock-tests-overview">

          <div className="mock-tests-overview-item">
            <span>
              Available subjects
            </span>

            <strong>
              {loading
                ? "—"
                : subjects.length}
            </strong>
          </div>


          <div className="mock-tests-overview-item">
            <span>
              Recommended length
            </span>

            <strong>
              20
            </strong>

            <small>
              questions
            </small>
          </div>


          <div className="mock-tests-overview-item">
            <span>
              Practice mode
            </span>

            <strong>
              Subject
            </strong>

            <small>
              focused revision
            </small>
          </div>

        </section>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mock-tests-error">
            {error}
          </div>
        )}


        {/* =================================================
            CREATE TEST
        ================================================= */}

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
                  Choose a subject and decide how
                  many questions you want to practice.
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

              {/* =================================================
                  SUBJECT
              ================================================= */}

              <label className="mock-test-field">

                <span>
                  Subject
                </span>

                <select
                  value={selectedSubject}
                  onChange={(event) => {
                    setSelectedSubject(
                      event.target.value
                    );

                    setError("");
                  }}
                  disabled={loading}
                >
                  <option value="">
                    {loading
                      ? "Loading subjects..."
                      : "Choose a subject"}
                  </option>

                  {subjects.map(
                    (subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name}
                      </option>
                    )
                  )}
                </select>

                <small>
                  {selectedSubject
                    ? `${selectedSubjectMaterialCount} material${
                        selectedSubjectMaterialCount === 1
                          ? ""
                          : "s"
                      } in this subject`
                    : "Questions will eventually be selected from this subject's combined question bank."}
                </small>

              </label>


              {/* =================================================
                  QUESTION COUNT
              ================================================= */}

              <label className="mock-test-field">

                <span>
                  Questions
                </span>

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
                  Choose a shorter session for
                  quick revision.
                </small>

              </label>


              {/* =================================================
                  DIFFICULTY
              ================================================= */}

              <div className="mock-test-field">

                <span>
                  Difficulty
                </span>

                <div className="difficulty-options">

                  {(
                    [
                      "Easy",
                      "Medium",
                      "Hard",
                    ] as Difficulty[]
                  ).map(
                    (level) => (
                      <button
                        key={level}
                        type="button"
                        className={
                          difficulty === level
                            ? "difficulty-option active"
                            : "difficulty-option"
                        }
                        onClick={() =>
                          setDifficulty(
                            level
                          )
                        }
                      >
                        {level}
                      </button>
                    )
                  )}

                </div>

                <small>
                  Choose the difficulty that matches
                  your revision goal.
                </small>

              </div>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="mock-test-create-footer">

              <span>
                {selectedSubjectName
                  ? `${selectedSubjectName} · ${questionCount} questions · ${difficulty}`
                  : "Select a subject to continue"}
              </span>


              <button
                type="button"
                className="mock-tests-primary-button"
                disabled={
                  loading ||
                  !selectedSubject
                }
                onClick={
                  handleCreateTest
                }
              >
                Start test

                <span>
                  →
                </span>
              </button>

            </div>

          </section>
        )}


        {/* =================================================
            FIRST TEST PROMPT
        ================================================= */}

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
                Test yourself on an entire subject.
              </h2>

              <p>
                Create a subject, add your study
                material to it, and eventually use
                the combined question bank for
                practice.
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
              Create a test
            </button>

          </section>
        )}


        {/* =================================================
            TEST HISTORY
        ================================================= */}

        <section className="mock-tests-library">

          <div className="mock-tests-section-header">

            <div>
              <p className="mock-tests-section-kicker">
                Your practice
              </p>

              <h2>
                Test history
              </h2>
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
              Completed tests and your scores will
              appear here.
            </p>

            <Link
              to="/materials"
              className="mock-tests-text-link"
            >
              Manage subjects →
            </Link>

          </div>

        </section>

      </div>
    </div>
  );
}

export default MockTests;