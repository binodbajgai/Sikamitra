import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  deleteStudyMaterial,
  uploadStudyMaterial,
  type StudyMaterial,
} from "../../api/studyMaterials.ts";

import {
  getSubject,
  getSubjectMaterials,
  type Subject,
} from "../../api/subjects.ts";

import {
  getDisplayFileName,
  getFileExtensionLabel,
} from "../../utils/fileDisplay.ts";

function SubjectDetail() {
  const { subjectId } =
    useParams<{ subjectId: string }>();

  const navigate = useNavigate();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [subject, setSubject] =
    useState<Subject | null>(null);

  const [materials, setMaterials] =
    useState<StudyMaterial[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");


  useEffect(() => {
    async function loadSubjectData() {
      if (!subjectId) {
        setError("Subject ID is missing.");
        setLoading(false);
        return;
      }

      const id = Number(subjectId);
      if (Number.isNaN(id)) {
        setError("Invalid subject ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [subjectData, materialsData] = await Promise.all([
          getSubject(id),
          getSubjectMaterials(id),
        ]);

        setSubject(subjectData);
        setMaterials(materialsData);
      } catch (err) {
        console.error(err);
        setError("Unable to load subject data.");
      } finally {
        setLoading(false);
      }
    }

    void loadSubjectData();
  }, [subjectId]);


  const subjectMaterials =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return materials;
      }

      return materials.filter((material) =>
        [material.title, material.file_name]
          .filter(Boolean)
          .some((field) =>
            String(field).toLowerCase().includes(value)
          )
      );
    }, [materials, search]);


  async function handleFile(file?: File) {
    if (!file || !subject) {
      return;
    }

    const validExtensions = [
      ".pdf",
      ".docx",
      ".txt",
      ".pptx",
      ".png",
      ".jpg",
      ".jpeg",
    ];

    const name =
      file.name.toLowerCase();

    const valid =
      validExtensions.some(
        (extension) =>
          name.endsWith(extension)
      );

    if (!valid) {
      setError(
        "Please upload a TXT, PDF, DOCX, PPTX, PNG, JPG, or JPEG file."
      );
      return;
    }

    try {
      setUploading(true);
      setError("");

      const material =
        await uploadStudyMaterial(file, subject.id);

      setMaterials((current) => [
        material,
        ...current,
      ]);
    } catch (err) {
      console.error(err);
      setError("Unable to add this material.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }


  async function handleDelete(
    material: StudyMaterial
  ) {
    const confirmed =
      window.confirm(
        `Delete "${material.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteStudyMaterial(
        material.id
      );

      setMaterials((current) =>
        current.filter(
          (item) =>
            item.id !== material.id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to delete this material."
      );
    }
  }


  if (!subject) {
    return (
      <div className="subject-detail-page">
        <div className="subject-detail-state">
          <h2>
            Subject not found
          </h2>

          <Link to="/study-materials">
            Back to subjects
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="subject-detail-page">
      <div className="subject-detail-container">

        <Link
          to="/study-materials"
          className="subject-back-link"
        >
          ← Study subjects
        </Link>


        <header className="subject-detail-header">

          <div>
            <p className="subjects-kicker">
              Subject
            </p>

            <h1>
              {subject.name}
            </h1>

            <p>
              {subject.description ||
                "Your study materials for this subject."}
            </p>
          </div>

          <button
            type="button"
            className="subjects-create-button"
            onClick={() =>
              navigate(
                "/mock-tests"
              )
            }
          >
            Create mock test →
          </button>

        </header>


        {error && (
          <div className="subjects-error">
            {error}
          </div>
        )}


        <section className="subject-material-toolbar">

          <div>
            <p className="subjects-kicker">
              Materials
            </p>

            <h2>
              {subjectMaterials.length}{" "}
              {subjectMaterials.length === 1
                ? "material"
                : "materials"}
            </h2>
          </div>

          <div className="subject-material-actions">

            <div className="subjects-search">
              <span>⌕</span>

              <input
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <button
              type="button"
              className="subjects-create-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploading}
            >
              {uploading
                ? "Uploading..."
                : "+ Add material"}
            </button>

          </div>

        </section>


        {loading ? (
          <div className="subject-detail-loading">
            Loading materials...
          </div>
        ) : subjectMaterials.length ===
          0 ? (
          <div className="subject-detail-empty">

            <div className="subjects-empty-mark">
              +
            </div>

            <h3>
              No materials in this subject
            </h3>

            <p>
              Add PDFs, documents, or notes to
              build this subject's study library.
            </p>

            <button
              type="button"
              className="subjects-create-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              Add material
            </button>

          </div>
        ) : (
          <div className="subject-material-list">

            {subjectMaterials.map(
              (material) => (
                <article
                  key={material.id}
                  className="subject-material-row"
                >

                  <div className="material-file-icon">
                    {getFileExtensionLabel(
                      material.file_name
                    )}
                  </div>

                  <div>
                    <Link
                      to={`/study-materials/${material.id}`}
                      className="material-row-title"
                    >
                      {getDisplayFileName(material.title)}
                    </Link>

                    <p>
                      {getDisplayFileName(material.file_name) ||
                        material.source_type ||
                        "Study material"}
                    </p>
                  </div>

                  <div className="subject-material-actions-row">

                    <Link
                      to={`/study-materials/${material.id}`}
                      className="material-open-button"
                    >
                      Open
                    </Link>

                    <button
                      type="button"
                      className="material-delete-button"
                      onClick={() =>
                        void handleDelete(
                          material
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        )}


        <section className="subject-test-prompt">

          <div>
            <p className="subjects-kicker">
              Practice this subject
            </p>

            <h2>
              Use everything in this subject
              for a mock test.
            </h2>

            <p>
              Once your subject has enough material,
              create a test from its combined question
              bank.
            </p>
          </div>

          <Link
            to="/mock-tests"
            className="subjects-create-button"
          >
            Create mock test
          </Link>

        </section>


        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".txt,.pdf,.docx,.pptx,.png,.jpg,.jpeg"
          onChange={(event) =>
            void handleFile(
              event.target.files?.[0]
            )
          }
        />

      </div>
    </div>
  );
}

export default SubjectDetail;