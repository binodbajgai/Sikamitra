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
  createTextStudyMaterial,
  deleteStudyMaterial,
  uploadMultipleStudyMaterials,
  type StudyMaterial,
} from "../../api/studyMaterials.ts";

import {
  deleteSubject,
  getSubject,
  getSubjectMaterials,
  updateSubject,
  type Subject,
} from "../../api/subjects.ts";

import {
  getDisplayFileName,
  getFileExtensionLabel,
} from "../../utils/fileDisplay.ts";

import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

function getApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: { detail?: unknown };
        };
      }
    ).response;
    const detail = response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  }

  return fallback;
}

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

  const [isAddingText, setIsAddingText] =
    useState(false);

  const [textTitle, setTextTitle] =
    useState("");

  const [textContent, setTextContent] =
    useState("");

  const [savingText, setSavingText] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [isEditing, setIsEditing] =
    useState(false);

  const [editName, setEditName] =
    useState("");

  const [editDescription, setEditDescription] =
    useState("");

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [showDeleteSubjectModal, setShowDeleteSubjectModal] =
    useState(false);

  const [isDeletingSubject, setIsDeletingSubject] =
    useState(false);

  const [deletingMaterial, setDeletingMaterial] =
    useState<StudyMaterial | null>(null);

  const [isDeletingMaterial, setIsDeletingMaterial] =
    useState(false);


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
        setEditName(subjectData.name);
        setEditDescription(subjectData.description || "");
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


  async function handleSaveSubjectEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject) return;

    const trimmed = editName.trim();
    if (!trimmed) {
      setError("Subject name cannot be empty.");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      const updated = await updateSubject(subject.id, {
        name: trimmed,
        description: editDescription.trim() || undefined,
      });

      setSubject(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update subject.");
    } finally {
      setSavingEdit(false);
    }
  }


  async function handleConfirmDeleteSubject() {
    if (!subject) return;

    try {
      setIsDeletingSubject(true);
      setError("");
      await deleteSubject(subject.id);
      navigate("/materials");
    } catch (err) {
      console.error(err);
      setError("Failed to delete subject.");
    } finally {
      setIsDeletingSubject(false);
    }
  }


  const subjectMaterials =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return materials;
      }

      return materials.filter((material) =>
        [material.title, material.file_name, material.content]
          .filter(Boolean)
          .some((field) =>
            String(field).toLowerCase().includes(value)
          )
      );
    }, [materials, search]);

  function closeTextModal() {
    if (savingText) {
      return;
    }

    setIsAddingText(false);
    setTextTitle("");
    setTextContent("");
  }

  async function handleCreateTextMaterial(event: React.FormEvent) {
    event.preventDefault();

    if (!subject) {
      return;
    }

    const title = textTitle.trim();
    const content = textContent.trim();

    if (!title || !content) {
      setError("Add a title and some text before saving.");
      return;
    }

    try {
      setSavingText(true);
      setError("");

      const material = await createTextStudyMaterial(
        title,
        content,
        subject.id
      );

      setMaterials((current) => [material, ...current]);
      setIsAddingText(false);
      setTextTitle("");
      setTextContent("");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Unable to save pasted text."));
    } finally {
      setSavingText(false);
    }
  }


  async function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles || !subject || selectedFiles.length === 0) {
      return;
    }

    const files = Array.from(selectedFiles);
    const validExtensions = [
      ".pdf",
      ".docx",
      ".txt",
      ".pptx",
      ".png",
      ".jpg",
      ".jpeg",
    ];

    const invalidFile = files.find((file) => {
      const name = file.name.toLowerCase();
      return !validExtensions.some((extension) => name.endsWith(extension));
    });

    if (invalidFile) {
      setError(
        `${invalidFile.name}: please upload a TXT, PDF, DOCX, PPTX, PNG, JPG, or JPEG file.`
      );
      return;
    }

    try {
      setUploading(true);
      setError("");

      const materials =
        await uploadMultipleStudyMaterials(files, subject.id);

      setMaterials((current) => [
        ...materials,
        ...current,
      ]);
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(
        err,
        "Unable to add this material."
      ));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }


  function handlePromptDelete(material: StudyMaterial) {
    setDeletingMaterial(material);
  }

  async function handleConfirmDeleteMaterial() {
    if (!deletingMaterial) return;

    try {
      setIsDeletingMaterial(true);
      await deleteStudyMaterial(deletingMaterial.id);

      setMaterials((current) =>
        current.filter((item) => item.id !== deletingMaterial.id)
      );
      setDeletingMaterial(null);
    } catch (err) {
      console.error(err);
      setError("Unable to delete this material.");
    } finally {
      setIsDeletingMaterial(false);
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
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={16} /> Study subjects
        </Link>


        <header className="subject-detail-header">

          <div>
            <p className="subjects-kicker">
              Subject
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <h1 style={{ margin: 0 }}>
                {subject.name}
              </h1>

              <div style={{ display: "inline-flex", gap: "8px" }}>
                <button
                  type="button"
                  className="subject-action-btn"
                  title="Edit subject name or description"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  className="subject-action-btn delete"
                  title="Delete subject"
                  onClick={() => setShowDeleteSubjectModal(true)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

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
            Create mock test
            <ArrowRight size={16} style={{ marginLeft: "4px" }} />
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
              <Search size={16} />

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
              <Plus size={16} />
              {uploading
                ? "Uploading..."
                : "Add material"}
            </button>

            <button
              type="button"
              className="subject-cancel-button"
              onClick={() => setIsAddingText(true)}
              disabled={uploading || savingText}
            >
              Paste text
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
              <Plus size={24} />
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
              <Plus size={16} />
              Add material
            </button>

            <button
              type="button"
              className="subject-cancel-button"
              onClick={() => setIsAddingText(true)}
            >
              Paste text
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
                      to={`/materials/${material.id}`}
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
                      to={`/materials/${material.id}`}
                      className="material-open-button"
                    >
                      Open
                    </Link>

                    <button
                      type="button"
                      className="material-delete-button"
                      onClick={() => handlePromptDelete(material)}
                    >
                      <Trash2 size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />
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
            <ArrowRight size={16} style={{ marginLeft: "4px" }} />
          </Link>

        </section>

        {/* EDIT MODAL */}
        {isEditing && (
          <div className="sikamitra-modal-overlay" onClick={() => setIsEditing(false)}>
            <div className="sikamitra-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="sikamitra-modal-header">
                <h3>Edit subject</h3>
                <button
                  type="button"
                  className="sikamitra-modal-close"
                  onClick={() => setIsEditing(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveSubjectEdit}>
                <div className="sikamitra-modal-body">
                  <label>
                    Subject name
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Subject name"
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Optional description"
                    />
                  </label>
                </div>

                <div className="sikamitra-modal-footer">
                  <button
                    type="button"
                    className="subject-cancel-button"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="subjects-create-button"
                    disabled={savingEdit}
                  >
                    {savingEdit ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAddingText && (
          <div
            className="sikamitra-modal-overlay"
            onClick={closeTextModal}
          >
            <div
              className="sikamitra-modal-card"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sikamitra-modal-header">
                <h3>Paste text</h3>
                <button
                  type="button"
                  className="sikamitra-modal-close"
                  onClick={closeTextModal}
                  disabled={savingText}
                  aria-label="Close paste text dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTextMaterial}>
                <div className="sikamitra-modal-body">
                  <label>
                    Title
                    <input
                      type="text"
                      required
                      value={textTitle}
                      onChange={(event) => setTextTitle(event.target.value)}
                      placeholder="e.g. Chapter 1 notes"
                      autoFocus
                    />
                  </label>

                  <label>
                    Text
                    <textarea
                      rows={10}
                      required
                      value={textContent}
                      onChange={(event) => setTextContent(event.target.value)}
                      placeholder="Paste your notes here..."
                    />
                  </label>
                </div>

                <div className="sikamitra-modal-footer">
                  <button
                    type="button"
                    className="subject-cancel-button"
                    onClick={closeTextModal}
                    disabled={savingText}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="subjects-create-button"
                    disabled={savingText}
                  >
                    {savingText ? "Saving..." : "Save text"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={showDeleteSubjectModal}
          title="Delete Subject"
          message={`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`}
          confirmText="Delete Subject"
          type="danger"
          isLoading={isDeletingSubject}
          onConfirm={handleConfirmDeleteSubject}
          onCancel={() => !isDeletingSubject && setShowDeleteSubjectModal(false)}
        />

        <ConfirmModal
          isOpen={deletingMaterial !== null}
          title="Delete Material"
          message={`Delete "${deletingMaterial ? getDisplayFileName(deletingMaterial.title) : ""}"? This cannot be undone.`}
          confirmText="Delete Material"
          type="danger"
          isLoading={isDeletingMaterial}
          onConfirm={handleConfirmDeleteMaterial}
          onCancel={() => !isDeletingMaterial && setDeletingMaterial(null)}
        />

        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept=".txt,.pdf,.docx,.pptx,.png,.jpg,.jpeg"
          onChange={(event) =>
            void handleFiles(event.target.files)
          }
        />

      </div>
    </div>
  );
}

export default SubjectDetail;