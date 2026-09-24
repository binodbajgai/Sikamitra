import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  deleteStudyMaterial,
  getStudyMaterials,
  uploadStudyMaterial,
  type StudyMaterial,
} from "../api/studyMaterials.ts";

import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
  type Subject,
} from "../api/subjects.ts";
import {
  formatUpdatedDate,
  getDisplayFileName,
  getFileExtensionLabel,
} from "../utils/fileDisplay.ts";
import {
  Folder,
  ArrowRight,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";

function Materials() {
  const location = useLocation();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [materials, setMaterials] =
    useState<StudyMaterial[]>([]);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showCreateSubject, setShowCreateSubject] =
    useState(false);

  const [subjectName, setSubjectName] =
    useState("");

  const [subjectDescription, setSubjectDescription] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showUnsorted, setShowUnsorted] =
    useState(true);

  const [editingSubject, setEditingSubject] =
    useState<Subject | null>(null);

  const [editSubjectName, setEditSubjectName] =
    useState("");

  const [editSubjectDesc, setEditSubjectDesc] =
    useState("");

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [deletingSubject, setDeletingSubject] =
    useState<Subject | null>(null);

  const [deletingMaterial, setDeletingMaterial] =
    useState<StudyMaterial | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);


  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [materialsData, subjectsData] = await Promise.all([
          getStudyMaterials(),
          getSubjects(),
        ]);

        setMaterials(materialsData);
        setSubjects(subjectsData);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load your study materials or subjects."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);


  useEffect(() => {
    const shouldOpenUpload =
      location.state &&
      typeof location.state === "object" &&
      "openUpload" in location.state &&
      location.state.openUpload;

    if (shouldOpenUpload) {
      const timer = window.setTimeout(() => {
        fileInputRef.current?.click();
      }, 150);

      return () => window.clearTimeout(timer);
    }
  }, [location.state]);


  const filteredMaterials =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return materials;
      }

      return materials.filter(
        (material) =>
          [
            material.title,
            material.file_name,
            material.source_type,
          ]
            .filter(Boolean)
            .some((field) =>
              String(field)
                .toLowerCase()
                .includes(value)
            )
      );
    }, [materials, search]);


  const unsortedMaterials =
    filteredMaterials.filter(
      (material) => material.subject_id === null || material.subject_id === undefined
    );


  async function handleCreateSubject() {
    const name =
      subjectName.trim();

    if (!name) {
      setError(
        "Enter a subject name."
      );
      return;
    }

    const exists =
      subjects.some(
        (subject) =>
          subject.name.toLowerCase() ===
          name.toLowerCase()
      );

    if (exists) {
      setError(
        "A subject with this name already exists."
      );
      return;
    }

    try {
      setError("");

      const newSubject = await createSubject({
        name,
        description: subjectDescription || undefined,
      });

      setSubjects((current) => [
        ...current,
        newSubject,
      ]);

      setSubjectName("");
      setSubjectDescription("");
      setShowCreateSubject(false);
    } catch (err) {
      console.error(err);
      setError("Failed to create subject. Please try again.");
    }
  }


  function handleOpenEditSubject(e: React.MouseEvent, subject: Subject) {
    e.preventDefault();
    e.stopPropagation();
    setEditingSubject(subject);
    setEditSubjectName(subject.name);
    setEditSubjectDesc(subject.description || "");
    setError("");
  }


  async function handleSaveSubjectEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSubject) return;

    const trimmed = editSubjectName.trim();
    if (!trimmed) {
      setError("Subject name cannot be empty.");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      const updated = await updateSubject(editingSubject.id, {
        name: trimmed,
        description: editSubjectDesc.trim() || undefined,
      });

      setSubjects((current) =>
        current.map((s) => (s.id === updated.id ? updated : s))
      );
      setEditingSubject(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update subject.");
    } finally {
      setSavingEdit(false);
    }
  }


  function handlePromptDeleteSubject(e: React.MouseEvent, subject: Subject) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingSubject(subject);
  }

  async function handleConfirmDeleteSubject() {
    if (!deletingSubject) return;

    try {
      setIsDeleting(true);
      setError("");
      await deleteSubject(deletingSubject.id);
      setSubjects((current) => current.filter((s) => s.id !== deletingSubject.id));
      const updatedMaterials = await getStudyMaterials();
      setMaterials(updatedMaterials);
      setDeletingSubject(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete subject.");
    } finally {
      setIsDeleting(false);
    }
  }


  async function handleFile(
    file?: File
  ) {
    if (!file) {
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

    const lowerName =
      file.name.toLowerCase();

    const valid =
      validExtensions.some(
        (extension) =>
          lowerName.endsWith(extension)
      );

    if (!valid) {
      setError(
        "Please upload a TXT, PDF, DOCX, PPTX, PNG, JPG, or JPEG file."
      );
      return;
    }

    try {
      setError("");

      const material =
        await uploadStudyMaterial(file);

      setMaterials((current) => [
        material,
        ...current,
      ]);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to upload this material."
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    }
  }


  function handlePromptDeleteMaterial(material: StudyMaterial) {
    setDeletingMaterial(material);
  }

  async function handleConfirmDeleteMaterial() {
    if (!deletingMaterial) return;

    try {
      setIsDeleting(true);
      setError("");

      await deleteStudyMaterial(deletingMaterial.id);

      setMaterials((current) =>
        current.filter((item) => item.id !== deletingMaterial.id)
      );
      setDeletingMaterial(null);
    } catch (err) {
      console.error(err);
      setError("Unable to delete this material.");
    } finally {
      setIsDeleting(false);
    }
  }


  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    void handleFile(
      event.target.files?.[0]
    );
  }


  function getSubjectMaterialCount(
    subjectId: number
  ) {
    return materials.filter(
      (material) => material.subject_id === subjectId
    ).length;
  }


  return (
    <div className="subjects-page">
      <div className="subjects-container">

        {/* HEADER */}
        <header className="subjects-header">
          <div>
            <p className="subjects-kicker">
              Your library
            </p>

            <h1>Study subjects</h1>

            <p>
              Organize your study material by
              subject and use the same subject
              later for mock tests.
            </p>
          </div>

          <button
            type="button"
            className="subjects-create-button"
            onClick={() => {
              setError("");
              setShowCreateSubject(true);
            }}
          >
            <Plus size={16} />
            New subject
          </button>
        </header>


        {/* SEARCH */}
        <div className="subjects-toolbar">
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

          <span className="subjects-count">
            {subjects.length} subjects ·{" "}
            {materials.length} materials
          </span>
        </div>


        {/* ERROR */}
        {error && (
          <div className="subjects-error">
            {error}
          </div>
        )}


        {/* CREATE SUBJECT */}
        {showCreateSubject && (
          <section className="subject-create-panel">

            <div className="subject-create-heading">
              <div>
                <p className="subjects-kicker">
                  New subject
                </p>

                <h2>
                  Create a study folder
                </h2>

                <p>
                  Materials inside this subject can
                  later be used together for mock tests.
                </p>
              </div>

              <button
                type="button"
                className="subject-close-button"
                onClick={() =>
                  setShowCreateSubject(
                    false
                  )
                }
              >
                <X size={18} />
              </button>
            </div>


            <div className="subject-create-fields">

              <label>
                Subject name

                <input
                  type="text"
                  value={subjectName}
                  onChange={(event) =>
                    setSubjectName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Python Programming"
                />
              </label>


              <label>
                Description
                <span>Optional</span>

                <input
                  type="text"
                  value={subjectDescription}
                  onChange={(event) =>
                    setSubjectDescription(
                      event.target.value
                    )
                  }
                  placeholder="e.g. OOP, functions and modules"
                />
              </label>

            </div>


            <div className="subject-create-actions">
              <button
                type="button"
                className="subject-cancel-button"
                onClick={() =>
                  setShowCreateSubject(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="subjects-create-button"
                onClick={
                  handleCreateSubject
                }
              >
                Create subject
              </button>
            </div>

          </section>
        )}


        {/* SUBJECTS */}
        <section className="subjects-list">

          <div className="subjects-section-heading">
            <div>
              <p className="subjects-kicker">
                Organized library
              </p>

              <h2>
                Your subjects
              </h2>
            </div>
          </div>


          {loading ? (
            <div className="subject-loading">
              Loading your library...
            </div>
          ) : subjects.length === 0 ? (
            <div className="subjects-empty">
              <div className="subjects-empty-mark">
                +
              </div>

              <h3>
                Create your first subject
              </h3>

              <p>
                Create folders such as Python,
                Databases, Mathematics, or AI and
                keep each subject's material together.
              </p>

              <button
                type="button"
                className="subjects-create-button"
                onClick={() =>
                  setShowCreateSubject(
                    true
                  )
                }
              >
                Create subject
              </button>
            </div>
          ) : (
            <div className="subject-grid">
              {subjects.map((subject) => {
                const count =
                  getSubjectMaterialCount(
                    subject.id
                  );

                return (
                  <Link
                    key={subject.id}
                    to={`/materials/subjects/${subject.id}`}
                    className="subject-card"
                  >
                    <div className="subject-card-top">
                      <div className="subject-folder-icon">
                        <Folder size={18} />
                      </div>

                      <div className="subject-card-actions">
                        <button
                          type="button"
                          className="subject-action-btn"
                          title="Edit subject"
                          onClick={(e) => handleOpenEditSubject(e, subject)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="subject-action-btn delete"
                          title="Delete subject"
                          onClick={(e) => handlePromptDeleteSubject(e, subject)}
                        >
                          <Trash2 size={15} />
                        </button>
                        <ArrowRight size={16} style={{ marginLeft: "4px", color: "var(--color-text-secondary)" }} />
                      </div>
                    </div>

                    <h3>
                      {subject.name}
                    </h3>

                    <p>
                      {subject.description ||
                        "Study materials and practice for this subject."}
                    </p>

                    <div className="subject-card-footer">
                      <strong>
                        {count}
                      </strong>

                      <span>
                        {count === 1
                          ? "material"
                          : "materials"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </section>


        {/* UNSORTED */}
        {!loading &&
          unsortedMaterials.length > 0 && (
            <section className="unsorted-section">

              <div className="unsorted-section-header">
                <span className="unsorted-section-icon" aria-hidden="true">
                  <AlertTriangle size={18} color="#eab308" />
                </span>
                <div>
                  <p className="subjects-kicker">Needs organizing</p>
                  <h2>Unsorted materials</h2>
                </div>

                <button
                  type="button"
                  className="unsorted-heading"
                  aria-expanded={showUnsorted}
                  onClick={() =>
                    setShowUnsorted(
                      (current) =>
                        !current
                    )
                  }
                >
                  <span className="unsorted-heading-count" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    {unsortedMaterials.length} {showUnsorted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>
              </div>


              {showUnsorted && (
                <div className="materials-list">
                  {unsortedMaterials.map(
                    (material) => (
                      <article
                        key={material.id}
                        className="material-row"
                      >
                        <div className="material-file-icon">
                          {getFileExtensionLabel(
                            material.file_name
                          )}
                        </div>

                        <div className="material-row-info">
                          <Link
                            to={`/materials/${material.id}`}
                            className="material-row-title"
                          >
                            {getDisplayFileName(material.title)}
                          </Link>

                          <p>
                            {getDisplayFileName(
                              material.file_name
                            ) ||
                              material.source_type ||
                              "Study material"}

                            {" · Updated "}

                            {formatUpdatedDate(
                              material.updated_at
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="material-delete-button"
                          onClick={() => handlePromptDeleteMaterial(material)}
                        >
                          <Trash2 size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                          Delete
                        </button>
                      </article>
                    )
                  )}
                </div>
              )}

            </section>
          )}

        {/* EDIT SUBJECT MODAL */}
        {editingSubject && (
          <div className="sikamitra-modal-overlay" onClick={() => setEditingSubject(null)}>
            <div className="sikamitra-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="sikamitra-modal-header">
                <h3>Edit subject</h3>
                <button
                  type="button"
                  className="sikamitra-modal-close"
                  onClick={() => setEditingSubject(null)}
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
                      value={editSubjectName}
                      onChange={(e) => setEditSubjectName(e.target.value)}
                      placeholder="e.g. Mathematics"
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      rows={3}
                      value={editSubjectDesc}
                      onChange={(e) => setEditSubjectDesc(e.target.value)}
                      placeholder="Optional details about this subject"
                    />
                  </label>
                </div>

                <div className="sikamitra-modal-footer">
                  <button
                    type="button"
                    className="subject-cancel-button"
                    onClick={() => setEditingSubject(null)}
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

        <ConfirmModal
          isOpen={deletingSubject !== null}
          title="Delete Subject"
          message={`Are you sure you want to delete "${deletingSubject?.name}"? Materials inside will remain available.`}
          confirmText="Delete Subject"
          type="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDeleteSubject}
          onCancel={() => !isDeleting && setDeletingSubject(null)}
        />

        <ConfirmModal
          isOpen={deletingMaterial !== null}
          title="Delete Material"
          message={`Delete "${deletingMaterial ? getDisplayFileName(deletingMaterial.title) : ""}"? This cannot be undone.`}
          confirmText="Delete Material"
          type="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDeleteMaterial}
          onCancel={() => !isDeleting && setDeletingMaterial(null)}
        />

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".txt,.pdf,.docx,.pptx,.png,.jpg,.jpeg"
          onChange={handleFileChange}
        />

      </div>
    </div>
  );
}

export default Materials;
