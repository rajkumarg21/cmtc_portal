export const getBackendFileUrl = (relativePath) => {
  if (!relativePath) return null;

  const BASE =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_APP_BACKEND_URL ||
    "http://localhost:8081";

  if (relativePath.startsWith("http")) return relativePath;

  return `${BASE.replace(/\/$/, "")}/${relativePath.replace(/^\//, "")}`;
};
