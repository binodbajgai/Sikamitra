import { useEffect, useState } from "react";
import {
  getMockTestAttemptHistory,
  getMockTests,
  type MockTest,
  type MockTestAttempt,
} from "../api/mockTests";

interface ProgressAttempt extends MockTestAttempt {
  testTitle: string;
}

function formatAttemptDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function Progress() {
  const [attempts, setAttempts] = useState<ProgressAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadProgress() {
      try {
        setLoading(true);
        setError("");

        const tests = await getMockTests();
        const histories = await Promise.all(
          tests.map(async (test: MockTest) => {
            const history = await getMockTestAttemptHistory(test.id);
            return history
              .filter((attempt) => attempt.submitted_at)
              .map((attempt) => ({
                ...attempt,
                testTitle: test.title,
              }));
          })
        );

        if (isCurrent) {
          setAttempts(
            histories
              .flat()
              .sort(
                (first, second) =>
                  new Date(second.submitted_at ?? second.started_at).getTime() -
                  new Date(first.submitted_at ?? first.started_at).getTime()
              )
          );
        }
      } catch {
        if (isCurrent) {
          setError("We could not load your progress right now.");
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    void loadProgress();

    return () => {
      isCurrent = false;
    };
  }, []);

  const averageScore = attempts.length
    ? Math.round(
        attempts.reduce((total, attempt) => total + attempt.score, 0) /
          attempts.length
      )
    : 0;
  const bestScore = attempts.length
    ? Math.max(...attempts.map((attempt) => attempt.score))
    : 0;

  return (
    <div className="progress-page">
      <div className="progress-container">
        <header className="progress-header">
          <div>
            <p className="progress-kicker">Your performance</p>
            <h1>Progress</h1>
            <p>Track your mock test results and keep building momentum.</p>
          </div>
        </header>

        {error && <p className="progress-error">{error}</p>}

        <section className="progress-metrics" aria-label="Progress summary">
          <article className="progress-metric-card">
            <span>Completed tests</span>
            <strong>{attempts.length}</strong>
          </article>
          <article className="progress-metric-card">
            <span>Average score</span>
            <strong>{averageScore}%</strong>
          </article>
          <article className="progress-metric-card">
            <span>Best score</span>
            <strong>{bestScore}%</strong>
          </article>
        </section>

        <section className="progress-history">
          <div className="progress-section-heading">
            <div>
              <p className="progress-kicker">Recent activity</p>
              <h2>Test history</h2>
            </div>
          </div>

          {loading ? (
            <div className="progress-empty">Loading your results...</div>
          ) : attempts.length === 0 ? (
            <div className="progress-empty">
              Complete a mock test to see your results here.
            </div>
          ) : (
            <div className="progress-history-list">
              {attempts.map((attempt) => (
                <article className="progress-history-row" key={attempt.id}>
                  <div>
                    <h3>{attempt.testTitle}</h3>
                    <p>
                      {formatAttemptDate(
                        attempt.submitted_at ?? attempt.started_at
                      )}
                    </p>
                  </div>
                  <div className="progress-history-score">
                    <strong>{attempt.score}%</strong>
                    <span>
                      {attempt.correct_answers}/{attempt.total_questions} correct
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Progress;
