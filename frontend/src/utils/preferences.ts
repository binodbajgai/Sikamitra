export type ThemePreference =
  | "light"
  | "dim"
  | "dark"
  | "oled"
  | "aurora"
  | "sepia"
  | "cyberpunk"
  | "ocean";

export interface UserPreferences {
  theme: ThemePreference;
  largerText: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = "sikamitra_preferences";

export const defaultPreferences: UserPreferences = {
  theme: "light",
  largerText: false,
  reduceMotion: false,
};

export const VALID_THEMES: ThemePreference[] = [
  "light",
  "dim",
  "dark",
  "oled",
  "aurora",
  "sepia",
  "cyberpunk",
  "ocean",
];

export function getUserPreferences(): UserPreferences {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const preferences = {
      ...defaultPreferences,
      ...(stored && typeof stored === "object" ? stored : {}),
    };
    if (!VALID_THEMES.includes(preferences.theme)) {
      preferences.theme = defaultPreferences.theme;
    }
    return preferences;
  } catch {
    return defaultPreferences;
  }
}

export function applyUserPreferences(preferences: UserPreferences): void {
  const root = document.documentElement;
  root.dataset.theme = preferences.theme;
  root.dataset.fontSize = preferences.largerText ? "large" : "default";
  root.dataset.reduceMotion = preferences.reduceMotion ? "true" : "false";
}

export function saveUserPreferences(preferences: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  applyUserPreferences(preferences);
}
