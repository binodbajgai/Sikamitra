import apiClient from "./client";

export interface User {
  id: number;
  email: string;
  full_name: string;
  university?: string | null;
  profile_image?: string | null;
  is_active: boolean;
}

export interface UserUpdate {
  full_name?: string;
  university?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ForgotPasswordResponse {
  token: string;
  expires_at: string;
}

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

export const register = async (userData: RegisterData): Promise<User> => {
  const response = await apiClient.post<User>(
    "/auth/register",
    userData
  );
  return response.data;
};

export const registerUser = register;

export const login = async (credentials: LoginData): Promise<TokenResponse> => {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

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
};

export const loginUser = login;

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(
    "/auth/me"
  );
  return response.data;
};

export const startGoogleAuth = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ?? window.location.origin;

  window.location.href = `${apiUrl}/auth/google/login`;
};

export async function updateCurrentUser(data: UserUpdate): Promise<User> {
  const response = await apiClient.patch<User>("/auth/me", data);
  return response.data;
}

export const updateProfile = updateCurrentUser;

export async function updateAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<User>("/auth/me/avatar", formData);
  return response.data;
}

export const uploadProfileImage = updateAvatar;

export async function changePassword(data: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  await apiClient.post("/auth/me/password", data);
}

export async function requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", {
    email,
  });
  return response.data;
}

export async function resetPassword(token: string, new_password: string): Promise<void> {
  await apiClient.post("/auth/reset-password", {
    token,
    new_password,
  });
}
