import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env"
});

try {
  const urlRaw = process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL;
  const url = urlRaw ? urlRaw.replace(/\s+/g, "") : "";
  if (url) {
    process.env.DATABASE_URL = url; // normaliza
  }
  if (url && (!process.env.DB_HOST || !process.env.DB_NAME)) {
    const u = new URL(url);
    process.env.DB_DIALECT = process.env.DB_DIALECT || "postgres";
    process.env.DB_HOST = process.env.DB_HOST || u.hostname;
    process.env.DB_PORT = process.env.DB_PORT || (u.port || "5432");
    process.env.DB_USER = process.env.DB_USER || decodeURIComponent(u.username || "");
    process.env.DB_PASS = process.env.DB_PASS || decodeURIComponent(u.password || "");
    process.env.DB_NAME = process.env.DB_NAME || (u.pathname || "").replace("/", "");
    const host = u.hostname || "";
    if (!process.env.DB_SSL && (process.env.NODE_ENV === "production" || /rlwy\.net$/i.test(host))) {
      process.env.DB_SSL = "true";
    }
  }
} catch {}

// Mapear WEB_ORIGIN → FRONTEND_URL quando necessário
if (!process.env.FRONTEND_URL && process.env.WEB_ORIGIN) {
  process.env.FRONTEND_URL = process.env.WEB_ORIGIN;
}
