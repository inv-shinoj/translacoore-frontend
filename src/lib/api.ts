import axios from "axios";
import { getAccessToken, setAccessToken } from "./authToken";

type RefreshHandler = () => Promise<string | null>;
type LogoutHandler = () => void;

let refreshHandler: RefreshHandler | null = null;
let logoutHandler: LogoutHandler | null = null;

export const registerAuthHandlers = (
  refresh: RefreshHandler,
  logout: LogoutHandler
) => {
  refreshHandler = refresh;
  logoutHandler = logout;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) promise.reject(error);
    else promise.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log(`[API] ${response.status} ${response.config.url}`);
    return response;
  },
  async error => {
    const originalRequest = error.config;

    const url: string = originalRequest.url ?? "";
    const isAuthEndpoint =
      url.includes("/accounts/login") ||
      url.includes("/accounts/token/refresh") ||
      url.includes("/accounts/logout");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      refreshHandler
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        console.log("[API] Access token expired — attempting refresh");
        const newToken = await refreshHandler();

        if (!newToken) throw new Error("Refresh failed");

        console.log("[API] Token refreshed successfully");
        setAccessToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error("[API] Token refresh failed — logging out", err);
        processQueue(err, null);
        logoutHandler?.();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    console.error(`[API] Error ${error.response?.status ?? "network"} — ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
