import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getStudyMaterial,
  type StudyMaterial,
} from "../api/studyMaterials.ts";

import apiClient from "../api/client.ts";

interface Summary {
  id: number;
  material_id: number;
  summary: string;
  created_at: string;
}

interface ImportantPoint {
  id: number;
  material_id: number;
  point: string;
  position: number;
  created_at: string;
}

interface Question {
  id: number;
  material_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation?: string | null;
  created_at: string;
}

function MaterialDetail() {
  const { materialId } = useParams<{
    materialId: string;
  }>();

  const [material, setMaterial] =
    useState<StudyMaterial | null>(null);

  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [importantPoints, setImportantPoints] =
    useState<ImportantPoint[]>([]);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [generatingSummary, setGeneratingSummary] =
    useState(false);

  const [generatingPoints, setGeneratingPoints] =
    useState(false);

  const [generatingQuestions, setGeneratingQuestions] =
    useState(false);

  async function loadMaterial() {
    if (!materialId) {
      setError("Invalid material.");
      setLoading(false);
      return;
    }

    const id = Number(materialId);

    if (Number.isNaN(id)) {
      setError("Invalid material ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const materialData =
        await getStudyMaterial(id);

      setMaterial(materialData);

      try {
        const response =
          await apiClient.get<Summary>(
            `/ai/materials/${id}/summary`
          );

        setSummary(response.data);
      } catch {
        setSummary(null);
      }

      try {
        const response =
          await apiClient.get<ImportantPoint[]>(
            `/ai/materials/${id}/important-points`
          );

        setImportantPoints(response.data);
      } catch {
        setImportantPoints([]);
      }

      try {
        const response =
          await apiClient.get<Question[]>(
            `/ai/materials/${id}/questions`
          );

        setQuestions(response.data);
      } catch {
        setQuestions([]);
      }
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load this study material."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMaterial();
  }, [materialId]);

  async function generateSummary() {
    if (!materialId) {
      return;
    }

    try {
      setGeneratingSummary(true);
      setError("");

      const endpoint = summary
        ? `/ai/materials/${materialId}/summary/regenerate`
        : `/ai/materials/${materialId}/summary`;

      const response =
        await apiClient.post<Summary>(endpoint);

      setSummary(response.data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to generate the summary."
      );
    } finally {
      setGeneratingSummary(false);
    }
  }

  async function generateImportantPoints() {
    if (!materialId) {
      return;
    }

    try {
      setGeneratingPoints(true);
      setError("");

      const endpoint =
        importantPoints.length > 0
          ? `/ai/materials/${materialId}/important-points/regenerate`
          : `/ai/materials/${materialId}/important-points`;

      const response =
        await apiClient.post<ImportantPoint[]>(
          endpoint
        );

      setImportantPoints(response.data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to generate important points."
      );
    } finally {
      setGeneratingPoints(false);
    }
  }

  async function generateQuestions() {
    if (!materialId) {
      return;
    }

    try {
      setGeneratingQuestions(true);
      setError("");

      const endpoint =
        questions.length > 0
          ? `/ai/materials/${materialId}/questions/regenerate`
          : `/ai/materials/${materialId}/questions`;

      const response =
        await apiClient.post<Question[]>(
          endpoint
        );

      setQuestions(response.data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to generate questions."
      );
    } finally {
      setGeneratingQuestions(false);
    }
  }

  function getExtension() {
    const extension = material?.file_name
      ?.split(".")
      .pop()
      ?.toUpperCase();

    return extension || "DOC";
  }

  if (loading) {
    return (
      <div className="material-detail-page">
        <div className="material-detail-state">
          <div className="state-mark">S</div>
          <p>Loading your material...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="material-detail-page">
        <div className="material-detail-state">
          <div className="state-mark">!</div>
          <h2>Material not found</h2>
          <p>{error || "This material is unavailable."}</p>

          <Link
            to="/materials"
            className="material-back-button"
          >
            Back to materials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="material-detail-page">
      <div className="material-detail-container">

        <header className="material-detail-header">
          <Link
            to="/materials"
            className="material-back-link"
          >
            ← Study materials
          </Link>

          <div className="material-detail-heading">
            <div>
              <div className="material-detail-meta">
                <span>{getExtension()}</span>
                <span>
                  {material.source_type ||
                    "Study material"}
                </span>
              </div>

              <h1>{material.title}</h1>

              <p>
                {material.file_name ||
                  "Your AI-powered study workspace"}
              </p>
            </div>

            <div className="material-detail-count">
              <strong>
                {questions.length}
              </strong>

              <span>
                questions
              </span>
            </div>
          </div>
        </header>

        {error && (
          <div className="material-detail-error">
            {error}
          </div>
        )}

        <main className="material-detail-content">

          {/* Summary */}
          <section className="study-section">
            <div className="study-section-header">
              <div>
                <p className="study-section-kicker">
                  Understand
                </p>

                <h2>Summary</h2>
              </div>

              <button
                type="button"
                className="study-action"
                onClick={() =>
                  void generateSummary()
                }
                disabled={generatingSummary}
              >
                {generatingSummary
                  ? "Generating..."
                  : summary
                    ? "Regenerate"
                    : "Generate"}
              </button>
            </div>

            {summary ? (
              <div className="summary-content">
                {summary.summary}
              </div>
            ) : (
              <div className="study-empty">
                <div className="study-empty-mark">
                  +
                </div>

                <h3>
                  No summary yet
                </h3>

                <p>
                  Generate a concise overview of this
                  material to make revision easier.
                </p>
              </div>
            )}
          </section>


          {/* Important points */}
          <section className="study-section">
            <div className="study-section-header">
              <div>
                <p className="study-section-kicker">
                  Remember
                </p>

                <h2>Important points</h2>
              </div>

              <button
                type="button"
                className="study-action"
                onClick={() =>
                  void generateImportantPoints()
                }
                disabled={generatingPoints}
              >
                {generatingPoints
                  ? "Generating..."
                  : importantPoints.length > 0
                    ? "Regenerate"
                    : "Generate"}
              </button>
            </div>

            {importantPoints.length > 0 ? (
              <div className="important-point-list">
                {importantPoints.map(
                  (point, index) => (
                    <article
                      key={point.id}
                      className="important-point-row"
                    >
                      <span>
                        {String(
                          point.position ||
                            index + 1
                        ).padStart(2, "0")}
                      </span>

                      <p>{point.point}</p>
                    </article>
                  )
                )}
              </div>
            ) : (
              <div className="study-empty">
                <div className="study-empty-mark">
                  +
                </div>

                <h3>
                  No important points yet
                </h3>

                <p>
                  Generate the key concepts you should
                  remember from this material.
                </p>
              </div>
            )}
          </section>


          {/* Questions */}
          <section className="study-section">
            <div className="study-section-header">
              <div>
                <p className="study-section-kicker">
                  Practice
                </p>

                <h2>Question bank</h2>
              </div>

              <button
                type="button"
                className="study-action"
                onClick={() =>
                  void generateQuestions()
                }
                disabled={generatingQuestions}
              >
                {generatingQuestions
                  ? "Generating..."
                  : questions.length > 0
                    ? "Regenerate"
                    : "Generate"}
              </button>
            </div>

            {questions.length > 0 ? (
              <div className="question-bank">
                {questions.map(
                  (question, index) => (
                    <article
                      key={question.id}
                      className="question-item"
                    >
                      <div className="question-item-header">
                        <span>
                          Question{" "}
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </div>

                      <h3>
                        {question.question}
                      </h3>

                      <div className="question-options-grid">
                        <div>
                          <b>A</b>
                          <span>
                            {question.option_a}
                          </span>
                        </div>

                        <div>
                          <b>B</b>
                          <span>
                            {question.option_b}
                          </span>
                        </div>

                        <div>
                          <b>C</b>
                          <span>
                            {question.option_c}
                          </span>
                        </div>

                        <div>
                          <b>D</b>
                          <span>
                            {question.option_d}
                          </span>
                        </div>
                      </div>

                      {question.explanation && (
                        <div className="question-explanation">
                          <strong>
                            Explanation
                          </strong>

                          <p>
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </article>
                  )
                )}
              </div>
            ) : (
              <div className="study-empty">
                <div className="study-empty-mark">
                  ?
                </div>

                <h3>
                  No questions yet
                </h3>

                <p>
                  Generate a question bank from this
                  material for active practice.
                </p>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}

export default MaterialDetail;