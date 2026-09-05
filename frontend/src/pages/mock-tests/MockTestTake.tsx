import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getMockTestQuestions,
  getMockTestAttemptReview,
  submitMockTestAttempt,
  type MockTestQuestion,
  type MockTestReview,
} from "../../api/mockTests";

function MockTestTake() {
  const [searchParams] = useSearchParams();
  const attemptIdParam = searchParams.get("attemptId");
  const testIdParam = searchParams.get("testId");

  const attemptId = attemptIdParam ? Number(attemptIdParam) : null;
  const testId = testIdParam ? Number(testIdParam) : null;

  const [questions, setQuestions] = useState<MockTestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [review, setReview] = useState<MockTestReview | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadTestQuestions() {
      if (!testId && !attemptId) {
        setError("No test session specified. Please select a mock test.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        if (testId) {
          const qList = await getMockTestQuestions(testId);
          setQuestions(qList);
        } else if (attemptId) {
          const reviewData = await getMockTestAttemptReview(attemptId);
          if (reviewData.questions && reviewData.questions.length > 0) {
            setQuestions(
              reviewData.questions.map((q) => ({
                question_id: q.question_id,
                question_order: q.question_order,
                question: q.question,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
              }))
            );
          }
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load test questions from backend.");
      } finally {
        setLoading(false);
      }
    }

    void loadTestQuestions();
  }, [testId, attemptId]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress =
    questions.length > 0
      ? Math.round(((currentIndex + 1) / questions.length) * 100)
      : 0;

  function selectAnswer(optionKey: string) {
    if (submitted || !currentQuestion) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [currentQuestion.question_id]: optionKey.toUpperCase(),
    }));
  }

  function goNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((current) => current + 1);
    }
  }

  function goPrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((current) => current - 1);
    }
  }

  async function handleSubmitTest() {
    if (!attemptId) {
      setSubmitted(true);
      return;
    }

    const unansweredCount = questions.length - answeredCount;

    if (
      unansweredCount > 0 &&
      !window.confirm(
        `You have ${unansweredCount} unanswered question${
          unansweredCount === 1 ? "" : "s"
        }. Submit your test anyway?`
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const answerPayload = Object.entries(answers).map(
        ([qIdStr, selected_option]) => ({
          question_id: Number(qIdStr),
          selected_option,
        })
      );

      await submitMockTestAttempt(attemptId, {
        answers: answerPayload,
      });

      const reviewData = await getMockTestAttemptReview(attemptId);
      setReview(reviewData);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);

      const detail = err?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((item: any) => item?.msg).filter(Boolean).join(" ")
        : detail;

      setError(
        typeof message === "string" && message.length > 0
          ? message
          : "Failed to submit test attempt. Please check your network connection."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mock-test-page">
        <div className="mock-test-container mock-test-state-panel">
          <h2>Loading mock test...</h2>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="mock-test-page">
        <div className="mock-test-container mock-test-state-panel">
          <h2>Unable to start test</h2>
          <p>{error}</p>
          <Link to="/mock-tests" className="mock-tests-primary-button">
            Back to mock tests
          </Link>
        </div>
      </div>
    );
  }

  if (submitted && review) {
    const percentage = review.score;
    const unansweredCount =
      review.total_questions - (review.correct_answers + review.wrong_answers);

    return (
      <div className="mock-test-page">
        <div className="mock-test-result-container">
          <div className="mock-test-result-header">
            <p className="mock-test-kicker">Test completed</p>
            <h1>Here's how you did.</h1>
            <p>
              Review your answers below and see where you got things right or
              where you should revise.
            </p>
          </div>

          <section className="mock-test-score-card">
            <div className="mock-test-score-circle">
              <strong>{percentage}%</strong>
              <span>score</span>
            </div>

            <div className="mock-test-score-details">
              <div>
                <span>Correct</span>
                <strong>{review.correct_answers}</strong>
              </div>

              <div>
                <span>Incorrect</span>
                <strong>{review.wrong_answers}</strong>
              </div>

              <div>
                <span>Unanswered</span>
                <strong>{unansweredCount}</strong>
              </div>
            </div>
          </section>

          <section className="mock-test-result-message">
            <p className="mock-test-section-kicker">Performance</p>
            <h2>
              {percentage >= 80
                ? "Strong understanding"
                : percentage >= 60
                ? "Good foundation"
                : "More revision recommended"}
            </h2>
            <p>
              Pay particular attention to the questions marked incorrect or
              unanswered.
            </p>
          </section>

          <section className="mock-test-review-section">
            <div className="mock-test-review-header">
              <div>
                <p className="mock-test-section-kicker">Review</p>
                <h2>Answer review</h2>
              </div>
              <span>
                {review.correct_answers} / {review.total_questions} correct
              </span>
            </div>

            <div className="mock-test-review-list">
              {review.questions.map((question, index) => {
                const isCorrect = question.is_correct;
                const isUnanswered = !question.selected_option;

                return (
                  <article
                    key={question.question_id}
                    className={[
                      "mock-test-review-item",
                      isCorrect
                        ? "correct"
                        : isUnanswered
                        ? "unanswered"
                        : "incorrect",
                    ].join(" ")}
                  >
                    <div className="mock-test-review-top">
                      <span>
                        Question {String(index + 1).padStart(2, "0")}
                      </span>
                      <strong>
                        {isCorrect
                          ? "Correct"
                          : isUnanswered
                          ? "Unanswered"
                          : "Incorrect"}
                      </strong>
                    </div>

                    <h3>{question.question}</h3>

                    <div className="mock-test-review-answers">
                      <div className="review-answer-row">
                        <span>Your answer</span>
                        <strong>
                          {question.selected_option
                            ? `${question.selected_option}: ${
                                question.selected_option === "A"
                                  ? question.option_a
                                  : question.selected_option === "B"
                                  ? question.option_b
                                  : question.selected_option === "C"
                                  ? question.option_c
                                  : question.option_d
                              }`
                            : "Not answered"}
                        </strong>
                      </div>

                      <div className="review-answer-row correct-answer">
                        <span>Correct answer</span>
                        <strong>
                          {question.correct_option}:{" "}
                          {question.correct_option === "A"
                            ? question.option_a
                            : question.correct_option === "B"
                            ? question.option_b
                            : question.correct_option === "C"
                            ? question.option_c
                            : question.option_d}
                        </strong>
                      </div>
                    </div>

                    {question.explanation && (
                      <div className="mock-test-review-explanation">
                        <span>Why</span>
                        <p>{question.explanation}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <div className="mock-test-result-actions">
            <Link to="/mock-tests" className="mock-tests-primary-button">
              Back to mock tests
            </Link>

            <Link to="/study-materials" className="mock-tests-outline-button">
              Study materials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-test-page">
      <div className="mock-test-container">
        <header className="mock-test-topbar">
          <Link to="/mock-tests" className="mock-test-exit">
            ← Exit test
          </Link>

          <div className="mock-test-title">
            <span>Practice session</span>
            <strong>Practice Test</strong>
          </div>

          <div className="mock-test-progress-label">
            {currentIndex + 1} / {questions.length}
          </div>
        </header>

        <div className="mock-test-progress">
          <div
            className="mock-test-progress-bar"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {error && (
          <div className="mock-tests-error" style={{ margin: "1rem 0" }}>
            {error}
          </div>
        )}

        <main className="mock-test-main">
          {currentQuestion && (
            <>
              <div className="mock-test-question-meta">
                <span>
                  QUESTION {String(currentIndex + 1).padStart(2, "0")}
                </span>
                <span>{answeredCount} answered</span>
              </div>

              <section className="mock-test-question-card">
                <h1>{currentQuestion.question}</h1>

                <div className="mock-test-options">
                  {[
                    { key: "A", text: currentQuestion.option_a },
                    { key: "B", text: currentQuestion.option_b },
                    { key: "C", text: currentQuestion.option_c },
                    { key: "D", text: currentQuestion.option_d },
                  ].map((option) => {
                    const isSelected =
                      answers[currentQuestion.question_id] === option.key;

                    return (
                      <button
                        key={option.key}
                        type="button"
                        className={
                          isSelected
                            ? "mock-test-option selected"
                            : "mock-test-option"
                        }
                        onClick={() => selectAnswer(option.key)}
                      >
                        <span className="mock-test-option-key">
                          {option.key}
                        </span>

                        <span className="mock-test-option-text">
                          {option.text}
                        </span>

                        <span className="mock-test-option-check">
                          {isSelected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="mock-test-navigation">
                <button
                  type="button"
                  className="mock-test-navigation-secondary"
                  onClick={goPrevious}
                  disabled={currentIndex === 0}
                >
                  ← Previous
                </button>

                <div className="mock-test-dots">
                  {questions.map((question, index) => {
                    const isCurrent = index === currentIndex;
                    const isAnswered = Boolean(answers[question.question_id]);

                    return (
                      <button
                        key={question.question_id}
                        type="button"
                        className={[
                          "mock-test-dot",
                          isCurrent ? "current" : "",
                          isAnswered ? "answered" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to question ${index + 1}`}
                      />
                    );
                  })}
                </div>

                {currentIndex === questions.length - 1 ? (
                  <button
                    type="button"
                    className="mock-test-submit"
                    onClick={() => void handleSubmitTest()}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit test"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mock-test-next"
                    onClick={goNext}
                  >
                    Next question →
                  </button>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default MockTestTake;