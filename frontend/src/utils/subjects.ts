import type { Subject } from "../types/subjects.ts";

const SUBJECTS_KEY = "sikamitra_subjects";
const MATERIAL_SUBJECTS_KEY =
  "sikamitra_material_subjects";

export function getSubjects(): Subject[] {
  try {
    const value =
      localStorage.getItem(SUBJECTS_KEY);

    if (!value) {
      return [];
    }

    return JSON.parse(value) as Subject[];
  } catch {
    return [];
  }
}

export function saveSubjects(
  subjects: Subject[]
) {
  localStorage.setItem(
    SUBJECTS_KEY,
    JSON.stringify(subjects)
  );
}

export function createSubject(
  name: string,
  description = ""
): Subject {
  const subject: Subject = {
    id: crypto.randomUUID(),
    name: name.trim(),
    description: description.trim(),
    createdAt: new Date().toISOString(),
  };

  const subjects = getSubjects();

  saveSubjects([
    ...subjects,
    subject,
  ]);

  return subject;
}

export function deleteSubject(
  subjectId: string
) {
  const subjects = getSubjects();

  saveSubjects(
    subjects.filter(
      (subject) => subject.id !== subjectId
    )
  );

  const assignments =
    getMaterialSubjectAssignments();

  Object.keys(assignments).forEach(
    (materialId) => {
      if (
        assignments[materialId] ===
        subjectId
      ) {
        delete assignments[materialId];
      }
    }
  );

  saveMaterialSubjectAssignments(
    assignments
  );
}

export function getMaterialSubjectAssignments(): Record<
  string,
  string
> {
  try {
    const value = localStorage.getItem(
      MATERIAL_SUBJECTS_KEY
    );

    if (!value) {
      return {};
    }

    return JSON.parse(value) as Record<
      string,
      string
    >;
  } catch {
    return {};
  }
}

export function saveMaterialSubjectAssignments(
  assignments: Record<string, string>
) {
  localStorage.setItem(
    MATERIAL_SUBJECTS_KEY,
    JSON.stringify(assignments)
  );
}

export function assignMaterialToSubject(
  materialId: number,
  subjectId: string
) {
  const assignments =
    getMaterialSubjectAssignments();

  assignments[String(materialId)] =
    subjectId;

  saveMaterialSubjectAssignments(
    assignments
  );
}

export function removeMaterialFromSubject(
  materialId: number
) {
  const assignments =
    getMaterialSubjectAssignments();

  delete assignments[String(materialId)];

  saveMaterialSubjectAssignments(
    assignments
  );
}