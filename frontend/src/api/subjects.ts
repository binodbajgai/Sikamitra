import apiClient from "./client";
import type { StudyMaterial } from "./studyMaterials";

export interface Subject {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubjectCreate {
  name: string;
  description?: string;
}

export async function getSubjects(): Promise<Subject[]> {
  const response = await apiClient.get<Subject[]>("/subjects/");
  return response.data;
}

export async function getSubject(subjectId: number): Promise<Subject> {
  const response = await apiClient.get<Subject>(`/subjects/${subjectId}`);
  return response.data;
}

export async function createSubject(data: SubjectCreate): Promise<Subject> {
  const response = await apiClient.post<Subject>("/subjects/", data);
  return response.data;
}

export async function getSubjectMaterials(
  subjectId: number
): Promise<StudyMaterial[]> {
  const response = await apiClient.get<StudyMaterial[]>(
    `/subjects/${subjectId}/materials`
  );
  return response.data;
}

export async function deleteSubject(subjectId: number): Promise<void> {
  await apiClient.delete(`/subjects/${subjectId}`);
}
