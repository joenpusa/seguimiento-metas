import axios from "axios";

let isRefreshing = false;
let refreshSubscribers = [];

// Función auxiliar: notifica a las solicitudes en espera cuando se renueva el token
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// Suscribe solicitudes que esperan a que se refresque el token
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Crear la instancia principal de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de petición: agrega el token si existe
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

// Interceptor de respuesta: maneja expiración de token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es un error 401 y no hemos intentado refrescar todavía
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          console.warn("No hay refresh token disponible");
          isRefreshing = false;
          return Promise.reject(error);
        }

        try {
          // Llamada para refrescar el token
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken: newToken } = response.data;

          // Guardar nuevo token
          localStorage.setItem("accessToken", newToken);

          // Notificar a todas las solicitudes en espera
          onRefreshed(newToken);

          // Volver a ejecutar las solicitudes en cola
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Error al refrescar token:", refreshError);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Si ya hay una solicitud de refresh en curso, espera a que termine
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

// Función dinámica para setear o limpiar tokens desde AuthContext
export const setAuthTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  else localStorage.removeItem("accessToken");

  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  else localStorage.removeItem("refreshToken");
};

export default api;
