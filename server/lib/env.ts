import "dotenv/config";

// Only what's actually used by the platform:
// - Turso (libSQL) database connection
// - Admin panel authentication (JWT-signed session token)
//
// OAuth (APP_ID/APP_SECRET/AUTH_URL/OPEN_URL/OWNER_UNION_ID) and filesystem
// upload storage (UPLOAD_DIR) were removed entirely — the platform never
// used real user accounts (Community uses plain guest names) and uploads
// are stored as base64 in Turso, not on disk.
export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  databaseAuthToken: process.env.DATABASE_AUTH_TOKEN ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  adminJwtSecret: process.env.ADMIN_JWT_SECRET ?? "",
};
