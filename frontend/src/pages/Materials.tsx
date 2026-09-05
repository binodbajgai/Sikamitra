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
  getSubjects,
  type Subject,
} from "../api/subjects.ts";
import {
  formatUpdatedDate,
  getDisplayFileName,
  getFileExtensionLabel,
} from "../utils/fileDisplay.ts";

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


  async function handleDelete(
    material: StudyMaterial
  ) {
    const confirmed =
      window.confirm(
        `Delete "${material.title}"? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

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
            <span>+</span>
            New subject
          </button>
        </header>


        {/* SEARCH */}
        <div className="subjects-toolbar">
          <div className="subjects-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search your materials..."
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
                ×
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
                    to={`/study-materials/subject/${subject.id}`}
                    className="subject-card"
                  >
                    <div className="subject-card-top">
                      <div className="subject-folder-icon">
                        □
                      </div>

                      <span>
                        →
                      </span>
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
                <span className="unsorted-section-icon" aria-hidden="true">!</span>
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
                  <span className="unsorted-heading-count">
                    {unsortedMaterials.length} {showUnsorted ? "⌃" : "⌄"}
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
                            to={`/study-materials/${material.id}`}
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
                          onClick={() =>
                            void handleDelete(
                              material
                            )
                          }
                        >
                          Delete
                        </button>
                      </article>
                    )
                  )}
                </div>
              )}

            </section>
          )}

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
