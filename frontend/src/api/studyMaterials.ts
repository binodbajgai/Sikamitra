import apiClient from "./client";

export interface StudyMaterial {
  id: number;
  user_id: number;

  title: string;

  source_type: 
    | "file"
    | "text";

  file_name: string | null;

  content: string | null;

  subject_id: number | null;

  subject_name: string | null;

  created_at: string;

  updated_at: string;
}


export async function getStudyMaterials(): Promise<StudyMaterial[]> {
  const response = await apiClient.get<StudyMaterial[]>(
    "/study-materials/"
  );

  return response.data;
}


export async function getStudyMaterial(
  materialId: number
): Promise<StudyMaterial> {

  const response =
    await apiClient.get<StudyMaterial>(
      `/study-materials/${materialId}`
    );

  return response.data;
}


export async function uploadStudyMaterial(
  file: File,
  subjectId?: number
): Promise<StudyMaterial> {

  const formData = new FormData();

  formData.append(
    "file",
    file
  );


  if(subjectId){
    formData.append(
      "subject_id",
      String(subjectId)
    );
  }


  const response =
    await apiClient.post<StudyMaterial>(
      "/study-materials/upload",
      formData
    );


  return response.data;
}


export async function deleteStudyMaterial(
  materialId:number
):Promise<void>{

  await apiClient.delete(
    `/study-materials/${materialId}`
  );

}