import apiClient from "./client";

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  university?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  university: string | null;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function registerUser(
  data: RegisterData
): Promise<User> {
  const response = await apiClient.post<User>(
    "/auth/register",
    data
  );

  return response.data;
}

export async function loginUser(
  data: LoginData
): Promise<TokenResponse> {
  const formData = new URLSearchParams();

  formData.append("username", data.email);
  formData.append("password", data.password);

  const response = await apiClient.post<TokenResponse>(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const token = localStorage.getItem("access_token");

  const response = await apiClient.get<User>(
    "/auth/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}