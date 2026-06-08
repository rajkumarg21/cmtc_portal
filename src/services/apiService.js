import axios from "axios";
import i18n from "i18next"; // ✅ this is the key

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // ✅ Attach JWT
    const token = sessionStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Detect language
    const language =
      i18n?.language ||                    // i18next
      localStorage.getItem("lang") ||      // manual storage
      navigator.language?.split("-")[0] || // browser
      "hi";

    // ✅ Send to backend
    config.headers["Accept-Language"] = language;

    // ✅ Content-Type handling
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("API No Response:", error.request);
    } else {
      console.error("API Setup Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
