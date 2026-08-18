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
  getStudyMaterials,
  uploadStudyMaterial,
  type StudyMaterial,
} from "../../api/studyMaterials.ts";

import type { Subject } from "../../types/subjects.ts";

import {
  assignMaterialToSubject,
  getMaterialSubjectAssignments,
  getSubjects,
  removeMaterialFromSubject,
} from "../../utils/subjects.ts";

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

  const [assignments, setAssignments] =
    useState<Record<string, string>>({});

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");


  useEffect(() => {
    const subjects =
      getSubjects();

    const found =
      subjects.find(
        (item) =>
          item.id === subjectId
      );

    setSubject(found || null);

    setAssignments(
      getMaterialSubjectAssignments()
    );
  }, [subjectId]);


  useEffect(() => {
    async function loadMaterials() {
      try {
        setLoading(true);

        const data =
          await getStudyMaterials();

        setMaterials(data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load the subject materials."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadMaterials();
  }, []);


  const subjectMaterials =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return materials.filter(
        (material) => {
          const belongs =
            assignments[
              String(material.id)
            ] === subjectId;

          if (!belongs) {
            return false;
          }

          if (!value) {
            return true;
          }

          return [
            material.title,
            material.file_name,
          ]
            .filter(Boolean)
            .some((field) =>
              String(field)
                .toLowerCase()
                .includes(value)
            );
        }
      );
    }, [
      materials,
      assignments,
      subjectId,
      search,
    ]);


  async function handleFile(
    file?: File
  ) {
    if (!file || !subjectId) {
      return;
    }

    const validExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
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
        "Please upload a PDF, DOC, DOCX, or TXT file."
      );

      return;
    }

    try {
      setUploading(true);
      setError("");

      const material =
        await uploadStudyMaterial(file);

      assignMaterialToSubject(
        material.id,
        subjectId
      );

      setAssignments(
        getMaterialSubjectAssignments()
      );

      setMaterials((current) => [
        material,
        ...current,
      ]);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to add this material."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
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

      removeMaterialFromSubject(
        material.id
      );

      setMaterials((current) =>
        current.filter(
          (item) =>
            item.id !== material.id
        )
      );

      setAssignments(
        getMaterialSubjectAssignments()
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

          <Link to="/materials">
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
          to="/materials"
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
                    {material.file_name
                      ?.split(".")
                      .pop()
                      ?.toUpperCase() ||
                      "DOC"}
                  </div>

                  <div>
                    <Link
                      to={`/materials/${material.id}`}
                      className="material-row-title"
                    >
                      {material.title}
                    </Link>

                    <p>
                      {material.file_name ||
                        material.source_type ||
                        "Study material"}
                    </p>
                  </div>

                  <div className="subject-material-actions-row">

                    <Link
                      to={`/materials/${material.id}`}
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
          accept=".pdf,.doc,.docx,.txt"
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