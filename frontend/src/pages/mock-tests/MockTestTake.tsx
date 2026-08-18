import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface MockQuestion {
  id: number;
  question: string;
  options: {
    key: string;
    text: string;
  }[];
  correctOption: string;
  explanation: string;
}

const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 1,
    question:
      "Which principle of object-oriented programming hides the internal implementation details of an object?",
    options: [
      { key: "A", text: "Inheritance" },
      { key: "B", text: "Encapsulation" },
      { key: "C", text: "Polymorphism" },
      { key: "D", text: "Abstraction" },
    ],
    correctOption: "B",
    explanation:
      "Encapsulation restricts direct access to an object's internal state and exposes controlled ways to interact with it.",
  },
  {
    id: 2,
    question:
      "Which Python keyword is used to define a class?",
    options: [
      { key: "A", text: "object" },
      { key: "B", text: "define" },
      { key: "C", text: "class" },
      { key: "D", text: "struct" },
    ],
    correctOption: "C",
    explanation:
      "Python uses the class keyword to define a class.",
  },
  {
    id: 3,
    question:
      "What allows a child class to acquire properties and methods from a parent class?",
    options: [
      { key: "A", text: "Inheritance" },
      { key: "B", text: "Encapsulation" },
      { key: "C", text: "Composition" },
      { key: "D", text: "Overloading" },
    ],
    correctOption: "A",
    explanation:
      "Inheritance allows a derived class to reuse attributes and behavior from a base class.",
  },
  {
    id: 4,
    question:
      "Which method is automatically called when a Python object is initialized?",
    options: [
      { key: "A", text: "__main__" },
      { key: "B", text: "__start__" },
      { key: "C", text: "__newclass__" },
      { key: "D", text: "__init__" },
    ],
    correctOption: "D",
    explanation:
      "The __init__ method initializes an instance after it is created.",
  },
  {
    id: 5,
    question:
      "Which concept allows the same interface to behave differently depending on the object?",
    options: [
      { key: "A", text: "Inheritance" },
      { key: "B", text: "Polymorphism" },
      { key: "C", text: "Encapsulation" },
      { key: "D", text: "Instantiation" },
    ],
    correctOption: "B",
    explanation:
      "Polymorphism allows the same interface or operation to have different implementations depending on the object.",
  },
];

function MockTestTake() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<
    Record<number, string>
  >({});

  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = MOCK_QUESTIONS[currentIndex];

  const answeredCount = Object.keys(answers).length;

  const progress = Math.round(
    ((currentIndex + 1) / MOCK_QUESTIONS.length) * 100
  );

  const score = useMemo(() => {
    return MOCK_QUESTIONS.reduce((total, question) => {
      return (
        total +
        (answers[question.id] === question.correctOption
          ? 1
          : 0)
      );
    }, 0);
  }, [answers]);

  function selectAnswer(option: string) {
    if (submitted) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: option,
    }));
  }

  function goNext() {
    if (currentIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentIndex((current) => current + 1);
    }
  }

  function goPrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((current) => current - 1);
    }
  }

  function submitTest() {
    setSubmitted(true);
  }

  function restartTest() {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
  }

  function getOptionText(
    question: MockQuestion,
    optionKey?: string
  ) {
    if (!optionKey) {
      return "Not answered";
    }

    return (
      question.options.find(
        (option) => option.key === optionKey
      )?.text || optionKey
    );
  }

  if (submitted) {
    const percentage = Math.round(
      (score / MOCK_QUESTIONS.length) * 100
    );

    const unansweredCount =
      MOCK_QUESTIONS.length - answeredCount;

    return (
      <div className="mock-test-page">
        <div className="mock-test-result-container">
          <div className="mock-test-result-header">
            <p className="mock-test-kicker">
              Test completed
            </p>

            <h1>Here's how you did.</h1>

            <p>
              Review your answers below and see where
              you got things right or where you should
              revise.
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
                <strong>{score}</strong>
              </div>

              <div>
                <span>Incorrect</span>
                <strong>
                  {MOCK_QUESTIONS.length - score}
                </strong>
              </div>

              <div>
                <span>Unanswered</span>
                <strong>{unansweredCount}</strong>
              </div>
            </div>
          </section>

          <section className="mock-test-result-message">
            <p className="mock-test-section-kicker">
              Performance
            </p>

            <h2>
              {percentage >= 80
                ? "Strong understanding"
                : percentage >= 60
                  ? "Good foundation"
                  : "More revision recommended"}
            </h2>

            <p>
              Pay particular attention to the questions
              marked incorrect or unanswered.
            </p>
          </section>

          {/* Answer review */}
          <section className="mock-test-review-section">
            <div className="mock-test-review-header">
              <div>
                <p className="mock-test-section-kicker">
                  Review
                </p>

                <h2>Answer review</h2>
              </div>

              <span>
                {score} / {MOCK_QUESTIONS.length} correct
              </span>
            </div>

            <div className="mock-test-review-list">
              {MOCK_QUESTIONS.map((question, index) => {
                const userAnswer =
                  answers[question.id];

                const isCorrect =
                  userAnswer === question.correctOption;

                const isUnanswered = !userAnswer;

                return (
                  <article
                    key={question.id}
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
                        Question{" "}
                        {String(index + 1).padStart(2, "0")}
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
                          {getOptionText(
                            question,
                            userAnswer
                          )}
                        </strong>
                      </div>

                      <div className="review-answer-row correct-answer">
                        <span>Correct answer</span>

                        <strong>
                          {getOptionText(
                            question,
                            question.correctOption
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="mock-test-review-explanation">
                      <span>Why</span>

                      <p>{question.explanation}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <div className="mock-test-result-actions">
            <button
              type="button"
              className="mock-tests-primary-button"
              onClick={restartTest}
            >
              Try again
            </button>

            <Link
              to="/mock-tests"
              className="mock-tests-outline-button"
            >
              Back to mock tests
            </Link>

            <Link
              to="/materials"
              className="mock-tests-outline-button"
            >
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
          <Link
            to="/mock-tests"
            className="mock-test-exit"
          >
            ← Exit test
          </Link>

          <div className="mock-test-title">
            <span>Practice session</span>
            <strong>Python OOP</strong>
          </div>

          <div className="mock-test-progress-label">
            {currentIndex + 1} / {MOCK_QUESTIONS.length}
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

        <main className="mock-test-main">
          <div className="mock-test-question-meta">
            <span>
              QUESTION{" "}
              {String(currentIndex + 1).padStart(2, "0")}
            </span>

            <span>{answeredCount} answered</span>
          </div>

          <section className="mock-test-question-card">
            <h1>{currentQuestion.question}</h1>

            <div className="mock-test-options">
              {currentQuestion.options.map((option) => {
                const isSelected =
                  answers[currentQuestion.id] ===
                  option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    className={
                      isSelected
                        ? "mock-test-option selected"
                        : "mock-test-option"
                    }
                    onClick={() =>
                      selectAnswer(option.key)
                    }
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
              {MOCK_QUESTIONS.map(
                (question, index) => {
                  const isCurrent =
                    index === currentIndex;

                  const isAnswered =
                    Boolean(answers[question.id]);

                  return (
                    <button
                      key={question.id}
                      type="button"
                      className={[
                        "mock-test-dot",
                        isCurrent ? "current" : "",
                        isAnswered ? "answered" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        setCurrentIndex(index)
                      }
                      aria-label={`Go to question ${
                        index + 1
                      }`}
                    />
                  );
                }
              )}
            </div>

            {currentIndex ===
            MOCK_QUESTIONS.length - 1 ? (
              <button
                type="button"
                className="mock-test-submit"
                onClick={submitTest}
              >
                Submit test
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
        </main>
      </div>
    </div>
  );
}

export default MockTestTake;