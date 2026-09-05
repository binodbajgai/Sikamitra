export function getDisplayFileName(fileName?: string | null): string {
  if (!fileName) {
    return "Study material";
  }

  const trimmed = fileName.trim();

  if (!trimmed) {
    return "Study material";
  }

  const sansUuid = trimmed.replace(
    /(?:^|[-_])[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?=\.[^./\\]+$|$)/g,
    ""
  );

  const cleaned = sansUuid
    .replace(/[-_]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned || trimmed;
}

export function getFileExtensionLabel(fileName?: string | null): string {
  const displayName = getDisplayFileName(fileName);
  const extension = displayName
    .split(".")
    .pop()
    ?.toUpperCase();

  return extension || "DOC";
}

export function formatUpdatedDate(date?: string | null): string {
  if (!date) {
    return "";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
