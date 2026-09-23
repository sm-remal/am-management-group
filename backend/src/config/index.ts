import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT || 5000,
  // PostgreSQL
  database_url: process.env.DATABASE_URL,
  database_ssl: process.env.DATABASE_SSL === "true",
  database_pool_max: Number(process.env.DATABASE_POOL_MAX || 10),
  app_url: process.env.APP_URL,
  company_name: process.env.COMPANY_NAME,
  support_email: process.env.SUPPORT_EMAIL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secrete: process.env.JWT_ACCESS_SECRETE,
  jwt_refresh_secrete: process.env.JWT_REFRESH_SECRETE,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: Number(process.env.SMTP_PORT || 587),
  smtp_user: process.env.SMTP_USER,
  smtp_password: process.env.SMTP_PASSWORD,
  smtp_from: process.env.SMTP_FROM,
  smtp_secure: process.env.SMTP_SECURE === "true",
};
