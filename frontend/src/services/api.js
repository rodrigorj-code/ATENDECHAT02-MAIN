import axios from "axios";

const getBaseUrl = (input) => {
  let url = (input || "").trim();
  if (!url) {
    if (typeof window !== "undefined" && window.location && window.location.origin) {
      const port = String(window.location.port || "");
      // Ambiente local: preferir 3000 (backend padrão do projeto)
      if (port) return "http://localhost:3000";
      return "http://localhost:3000";
    }
    return "http://localhost:3000";
  }
  if (/^https?:\/\//i.test(url)) {
    return url.replace(/\/+$/, "");
  }
  // Support ws/wss inputs by converting to http(s)
  if (/^wss?:\/\//i.test(url)) {
    url = url.replace(/^ws/i, "http");
    return url.replace(/\/+$/, "");
  }
  // If it looks like host[:port][/path], prepend http://
  if (/^[\w.-]+(?::\d+)?(\/.*)?$/.test(url)) {
    return `http://${url}`.replace(/\/+$/, "");
  }
  // Fallback: try to construct URL relative to current origin
  try {
    const abs = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost:8080");
    return abs.origin.replace(/\/+$/, "");
  } catch {
    return "http://localhost:8080";
  }
};

const baseURL = getBaseUrl(process.env.REACT_APP_BACKEND_URL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000
});

export const openApi = axios.create({
  baseURL,
  timeout: 20000
});

const shouldRetry = (error) => {
  const cfg = error?.config || {};
  const method = String(cfg.method || "get").toLowerCase();
  const isGet = method === "get";
  const isTimeout = error?.code === "ECONNABORTED";
  const isNetwork = error?.message === "Network Error";
  return isGet && (isTimeout || isNetwork) && (cfg.__retryCount || 0) < 1;
};

const scheduleRetry = (config) =>
  new Promise((resolve) => {
    const retryAfter = 1000;
    setTimeout(() => resolve({ ...config, __retryCount: (config.__retryCount || 0) + 1, timeout: Math.max(config.timeout || 0, 25000) }), retryAfter);
  });

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (shouldRetry(error)) {
      const nextCfg = await scheduleRetry(error.config);
      return api.request(nextCfg);
    }
    if (
      error?.response?.status === 402 &&
      error?.response?.data?.error === "ERR_SUBSCRIPTION_EXPIRED" &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/financeiro-aberto"
    ) {
      window.location.assign("/financeiro-aberto");
    }
    return Promise.reject(error);
  }
);

openApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (shouldRetry(error)) {
      const nextCfg = await scheduleRetry(error.config);
      return openApi.request(nextCfg);
    }
    return Promise.reject(error);
  }
);

export default api;
