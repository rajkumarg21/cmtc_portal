export const getFileSize = async (url) => {
  try {
    const head = await fetch(url, { method: "HEAD" });
    const size = head.headers.get("Content-Length");
    return size ? (size / 1024).toFixed(2) + " KB" : "N/A";
  } catch {
    return "N/A";
  }
};