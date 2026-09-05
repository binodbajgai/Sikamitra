import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  createSubjectMockTest,
  getMockTests,
  startMockTestAttempt,
  type MockTest,
} from "../../api/mockTests.ts";
import { getSubjects, type Subject } from "../../api/subjects.ts";
import {
  getStudyMaterials,
  type StudyMaterial,
} from "../../api/studyMaterials.ts";

type Difficulty =
  | "Easy"
  | "Medium"
  | "Hard";

function MockTests() {
  const navigate = useNavigate();

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [materials, setMaterials] =
    useState<StudyMaterial[]>([]);

  const [mockTests, setMockTests] =
    useState<MockTest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

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

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [subjectsData, mockTestsData, materialsData] = await Promise.all([
          getSubjects(),
          getMockTests(),
          getStudyMaterials().catch(() => []),
        ]);

        setSubjects(subjectsData);
        setMockTests(mockTestsData);
        setMaterials(materialsData);
      } catch (err) {
        console.error(err);
        setError("Unable to load subjects or mock tests.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const selectedSubjectMaterialCount = useMemo(() => {
    if (!selectedSubject) return 0;
    const subId = Number(selectedSubject);
    return materials.filter((m) => m.subject_id === subId).length;
  }, [materials, selectedSubject]);

  const selectedSubjectName =
    useMemo(() => {
      const subId = Number(selectedSubject);
      return (
        subjects.find(
          (subject) =>
            subject.id === subId
        )?.name || ""
      );
    }, [
      subjects,
      selectedSubject,
    ]);

  async function handleCreateTest() {
    if (!selectedSubject) {
      setError(
        "Choose a subject before creating a test."
      );
      return;
    }

    const subId = Number(selectedSubject);
    if (Number.isNaN(subId)) {
      setError("Invalid subject chosen.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const title = `${selectedSubjectName} Mock Test`;
      const qCount = Number(questionCount) || 10;

      const createdTest = await createSubjectMockTest(subId, {
        title,
        question_count: qCount,
      });

      const attempt = await startMockTestAttempt(createdTest.id);

      navigate(`/mock-tests/take?attemptId=${attempt.id}&testId=${createdTest.id}`);
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.detail ||
        "Failed to create mock test. Ensure questions exist for this subject.";
      setError(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleStartExistingTest(testId: number) {
    try {
      setLoading(true);
      setError("");

      const attempt = await startMockTestAttempt(testId);
      navigate(`/mock-tests/take?attemptId=${attempt.id}&testId=${testId}`);
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.detail ||
        "Failed to start test attempt.";
      setError(message);
    } finally {
      setLoading(false);
    }
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
                  creating ||
                  !selectedSubject
                }
                onClick={
                  handleCreateTest
                }
              >
                {creating ? "Creating test..." : "Start test"}

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
                material to it, and use the generated
                question bank for practice.
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
                Test library ({mockTests.length})
              </h2>
            </div>

          </div>

          {mockTests.length === 0 ? (
            <div className="mock-tests-empty">

              <div className="mock-tests-empty-mark">
                —
              </div>

              <h3>
                No tests created yet
              </h3>

              <p>
                Created tests and your score history will
                appear here.
              </p>

              <Link
                to="/study-materials"
                className="mock-tests-text-link"
              >
                Manage subjects →
              </Link>

            </div>
          ) : (
            <div className="mock-tests-library-list">
              {mockTests.map((test) => (
                <article key={test.id} className="mock-tests-library-row">
                  <div>
                    <h3>
                      {test.title}
                    </h3>
                    <p>
                      {test.question_count} questions · Created {new Date(test.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="mock-tests-primary-button"
                    onClick={() => void handleStartExistingTest(test.id)}
                  >
                    Take test →
                  </button>
                </article>
              ))}
            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default MockTests;