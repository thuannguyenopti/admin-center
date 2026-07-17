import axios from "axios";
import { getCurrentUserId } from "./currentUser";

const baseURL =
  process.env.NEXT_PUBLIC_MESSAGING_API_URL ?? "/api/messaging/v1";

const http = axios.create({
  baseURL,
  headers: {
    "X-Opal-Instance-ID": "im-prototype",
    "X-Opal-Customer-ID": "opti",
  },
});

// Inject the active user ID per request so changing identity in one tab
// (or sending as a VAU teammate via per-call override) takes effect immediately.
http.interceptors.request.use((config) => {
  const headers = config.headers as Record<string, unknown>;
  const hasOverride =
    headers && typeof headers["X-Opal-User-ID"] === "string";
  if (!hasOverride) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, unknown>)["X-Opal-User-ID"] =
      getCurrentUserId();
  }
  return config;
});

export default http;
