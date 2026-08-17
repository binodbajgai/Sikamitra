import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";

import {
  getStudyMaterial,
  type StudyMaterial,
} from "../api/studyMaterials";

import apiClient from "../api/client";

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

  const [generatingSummary, setGeneratingSummary] =
    useState(false);

  const [generatingPoints, setGeneratingPoints] =
    useState(false);

  const [generatingQuestions, setGeneratingQuestions] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * ============================================================
   * LOAD MATERIAL + EXISTING AI RESULTS
   * ============================================================
   */

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

      /*
       * Summary
       */

      try {
        const response =
          await apiClient.get<Summary>(
            `/ai/materials/${id}/summary`
          );

        setSummary(response.data);
      } catch {
        setSummary(null);
      }

      /*
       * Important points
       */

      try {
        const response =
          await apiClient.get<ImportantPoint[]>(
            `/ai/materials/${id}/important-points`
          );

        setImportantPoints(response.data);
      } catch {
        setImportantPoints([]);
      }

      /*
       * Questions
       */

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
    loadMaterial();
  }, [materialId]);

  /*
   * ============================================================
   * SUMMARY
   * ============================================================
   */

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
        await apiClient.post<Summary>(
          endpoint
        );

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

  /*
   * ============================================================
   * IMPORTANT POINTS
   * ============================================================
   */

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

  /*
   * ============================================================
   * QUESTIONS
   * ============================================================
   */

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

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="material-detail-page">
        <div className="material-detail-loading">
          Loading material...
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * MATERIAL NOT FOUND
   * ============================================================
   */

  if (!material) {
    return (
      <div className="material-detail-page">
        <NavLink
          to="/materials"
          className="back-link"
        >
          ← Library
        </NavLink>

        <div className="material-detail-error">
          {error || "Material not found."}
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="material-detail-page">
      <header className="material-detail-header">
        <NavLink
          to="/materials"
          className="back-link"
        >
          ← Library
        </NavLink>

        <span className="section-kicker">
          Study material
        </span>

        <h1>{material.title}</h1>

        <p>
          {material.file_name ||
            "Uploaded study material"}
        </p>
      </header>

      {error && (
        <div className="materials-error">
          {error}
        </div>
      )}

      <main className="material-detail-content">

        {/* ======================================================
            SUMMARY
        ====================================================== */}

        <section className="ai-section">
          <div className="ai-section-header">
            <div>
              <span className="section-kicker">
                AI analysis
              </span>

              <h2>Summary</h2>
            </div>

            <button
              type="button"
              className="ai-action"
              onClick={generateSummary}
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
            <div className="ai-content">
              {summary.summary}
            </div>
          ) : (
            <div className="ai-empty">
              <p>
                No summary has been generated yet.
              </p>
            </div>
          )}
        </section>

        {/* ======================================================
            IMPORTANT POINTS
        ====================================================== */}

        <section className="ai-section">
          <div className="ai-section-header">
            <div>
              <span className="section-kicker">
                Key information
              </span>

              <h2>Important points</h2>
            </div>

            <button
              type="button"
              className="ai-action"
              onClick={generateImportantPoints}
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
            <div className="important-points">
              {importantPoints.map(
                (point, index) => (
                  <div
                    className="important-point"
                    key={point.id}
                  >
                    <span>
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <p>
                      {point.point}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="ai-empty">
              <p>
                No important points have been
                generated yet.
              </p>
            </div>
          )}
        </section>

        {/* ======================================================
            QUESTIONS
        ====================================================== */}

        <section className="ai-section">
          <div className="ai-section-header">
            <div>
              <span className="section-kicker">
                Practice
              </span>

              <h2>Questions</h2>
            </div>

            <button
              type="button"
              className="ai-action"
              onClick={generateQuestions}
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
            <div className="questions-list">
              {questions.map(
                (question, index) => (
                  <article
                    className="question-card"
                    key={question.id}
                  >
                    <span className="question-number">
                      Question {index + 1}
                    </span>

                    <h3>
                      {question.question}
                    </h3>

                    <div className="question-options">

                      <div>
                        <strong>A</strong>

                        <span>
                          {question.option_a}
                        </span>
                      </div>

                      <div>
                        <strong>B</strong>

                        <span>
                          {question.option_b}
                        </span>
                      </div>

                      <div>
                        <strong>C</strong>

                        <span>
                          {question.option_c}
                        </span>
                      </div>

                      <div>
                        <strong>D</strong>

                        <span>
                          {question.option_d}
                        </span>
                      </div>

                    </div>
                  </article>
                )
              )}
            </div>
          ) : (
            <div className="ai-empty">
              <p>
                Generate questions from this
                material for practice.
              </p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default MaterialDetail;