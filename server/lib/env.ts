import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  return value ?? "placeholder";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL || "libsql://dummy.turso.io",
  databaseAuthToken: process.env.DATABASE_AUTH_TOKEN ?? "",
  authUrl: required("AUTH_URL"),
  openUrl: required("OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "urt-admin-2024",
  adminJwtSecret: process.env.ADMIN_JWT_SECRET ?? "urt-jwt-secret-key-change-in-production",
  uploadDir: process.env.UPLOAD_DIR ?? "/mnt/agents/output/app/uploads",
};
