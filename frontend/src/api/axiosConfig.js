import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let isRefreshing = false;
let refreshSubscribers = [];

// ===============================
// UTILIDADES REFRESH
// ===============================
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// ===============================
// INSTANCIA AXIOS
// ===============================
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        clearSession();
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const res = await axios.post(
            `${API_URL}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken: newToken } = res.data;

          setAuthTokens(newToken, refreshToken);

          // 🔹 Actualizar headers globales
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

          onRefreshed(newToken);

          return api(originalRequest);
        } catch (err) {
          clearSession();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      // Esperar a que termine el refresh
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// ===============================
// SESIÓN
// ===============================
const clearSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// ===============================
// API PÚBLICA
// ===============================
export const setAuthTokens = (accessToken, refreshToken) => {
  if (accessToken)
    localStorage.setItem("accessToken", accessToken);
  else localStorage.removeItem("accessToken");

  if (refreshToken)
    localStorage.setItem("refreshToken", refreshToken);
  else localStorage.removeItem("refreshToken");
};

export default api;
