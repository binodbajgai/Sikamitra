import apiClient from "./client";

export interface MockTest {
  id: number;
  user_id: number;
  material_id: number | null;
  subject_id: number | null;
  title: string;
  question_count: number;
  created_at: string;
}

export interface MockTestCreate {
  title: string;
  question_count: number;
}

export interface MockTestQuestion {
  question_id: number;
  question_order: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export interface MockTestAttempt {
  id: number;
  mock_test_id: number;
  user_id: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score: number;
  started_at: string;
  submitted_at: string | null;
}

export interface MockTestAnswerInput {
  question_id: number;
  selected_option: string;
}

export interface MockTestAttemptCreate {
  answers: MockTestAnswerInput[];
}

export interface MockTestReviewQuestion {
  question_id: number;
  question_order: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  selected_option: string;
  correct_option: string;
  is_correct: boolean;
  explanation: string | null;
}

export interface MockTestReview {
  attempt_id: number;
  mock_test_id: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score: number;
  questions: MockTestReviewQuestion[];
}

export async function createMaterialMockTest(
  materialId: number,
  data: MockTestCreate
): Promise<MockTest> {
  const response = await apiClient.post<MockTest>(
    `/mock-tests/materials/${materialId}`,
    data
  );
  return response.data;
}

export async function createSubjectMockTest(
  subjectId: number,
  data: MockTestCreate
): Promise<MockTest> {
  const response = await apiClient.post<MockTest>(
    `/mock-tests/subjects/${subjectId}`,
    data
  );
  return response.data;
}

export async function getMockTests(): Promise<MockTest[]> {
  const response = await apiClient.get<MockTest[]>("/mock-tests/");
  return response.data;
}

export async function getMockTest(mockTestId: number): Promise<MockTest> {
  const response = await apiClient.get<MockTest>(`/mock-tests/${mockTestId}`);
  return response.data;
}

export async function getMockTestQuestions(
  mockTestId: number
): Promise<MockTestQuestion[]> {
  const response = await apiClient.get<MockTestQuestion[]>(
    `/mock-tests/${mockTestId}/questions`
  );
  return response.data;
}

export async function deleteMockTest(mockTestId: number): Promise<void> {
  await apiClient.delete(`/mock-tests/${mockTestId}`);
}

export async function startMockTestAttempt(
  mockTestId: number
): Promise<MockTestAttempt> {
  const response = await apiClient.post<MockTestAttempt>(
    `/mock-tests/${mockTestId}/attempts`
  );
  return response.data;
}

export async function getMockTestAttempt(
  attemptId: number
): Promise<MockTestAttempt> {
  const response = await apiClient.get<MockTestAttempt>(
    `/mock-test-attempts/${attemptId}`
  );
  return response.data;
}

export async function submitMockTestAttempt(
  attemptId: number,
  data: MockTestAttemptCreate
): Promise<MockTestAttempt> {
  const response = await apiClient.post<MockTestAttempt>(
    `/mock-test-attempts/${attemptId}/submit`,
    data
  );
  return response.data;
}

export async function getMockTestAttemptReview(
  attemptId: number
): Promise<MockTestReview> {
  const response = await apiClient.get<MockTestReview>(
    `/mock-test-attempts/${attemptId}/review`
  );
  return response.data;
}

export async function getMockTestAttemptHistory(
  mockTestId: number
): Promise<MockTestAttempt[]> {
  const response = await apiClient.get<MockTestAttempt[]>(
    `/mock-tests/${mockTestId}/attempts`
  );
  return response.data;
}
