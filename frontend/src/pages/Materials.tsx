import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  deleteStudyMaterial,
  getStudyMaterials,
  uploadStudyMaterial,
  type StudyMaterial,
} from "../api/studyMaterials";

function Materials() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadMaterials() {
    try {
      setLoading(true);
      setError("");

      const data = await getStudyMaterials();

      setMaterials(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load your study materials.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      const material = await uploadStudyMaterial(file);

      setMaterials((current) => [
        material,
        ...current,
      ]);
    } catch (error) {
      console.error(error);
      setError("Unable to upload this document.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleDelete(materialId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this study material?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteStudyMaterial(materialId);

      setMaterials((current) =>
        current.filter(
          (material) => material.id !== materialId
        )
      );
    } catch (error) {
      console.error(error);
      setError("Unable to delete this material.");
    }
  }

  return (
    <div className="materials-page">
      <header className="materials-header">
        <div className="materials-header-left">
          <NavLink
            to="/dashboard"
            className="back-link"
          >
            ← Overview
          </NavLink>

          <span className="section-kicker">
            Library
          </span>

          <h1>Study materials</h1>

          <p>
            Keep your notes, documents, and study resources
            in one place.
          </p>
        </div>

        <div className="materials-header-action">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleUpload}
            disabled={uploading}
            hidden
          />

          <button
            type="button"
            className="upload-button"
            onClick={openFilePicker}
            disabled={uploading}
          >
            {uploading
              ? "Uploading..."
              : "+ Upload document"}
          </button>
        </div>
      </header>

      {error && (
        <div className="materials-error">
          {error}
        </div>
      )}

      <main className="materials-content">
        <div className="materials-section-header">
          <div>
            <span className="section-kicker">
              Your library
            </span>

            <h2>
              {materials.length === 0
                ? "No materials yet"
                : `${materials.length} ${
                    materials.length === 1
                      ? "material"
                      : "materials"
                  }`}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="materials-empty">
            <div className="empty-marker">...</div>

            <h2>Loading your materials</h2>

            <p>
              We're retrieving your study library.
            </p>
          </div>
        ) : materials.length === 0 ? (
          <div className="materials-empty">
            <div className="empty-marker">+</div>

            <h2>Your library is empty</h2>

            <p>
              Upload your first document to start
              building your study library.
            </p>

            <button
              type="button"
              className="empty-upload-button"
              onClick={openFilePicker}
            >
              Upload your first document
            </button>
          </div>
        ) : (
          <div className="materials-list">
            {materials.map((material) => (
              <article
                className="material-card"
                key={material.id}
              >
                <div className="material-card-main">
                  <div className="material-card-top">
                    <span className="material-type">
                      {material.source_type}
                    </span>

                    <span className="material-id">
                      #{material.id}
                    </span>
                  </div>

                  <h3>
                    {material.title}
                  </h3>

                  {material.file_name && (
                    <p className="material-file-name">
                      {material.file_name}
                    </p>
                  )}

                  <time>
                    Updated{" "}
                    {new Date(
                      material.updated_at
                    ).toLocaleDateString()}
                  </time>
                </div>

                <div className="material-card-actions">
                  <NavLink
                    to={`/materials/${material.id}`}
                    className="material-view"
                  >
                    View →
                  </NavLink>

                  <button
                    type="button"
                    className="material-delete"
                    onClick={() =>
                      handleDelete(material.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Materials;