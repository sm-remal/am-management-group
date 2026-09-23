import express from "express";
import cors from "cors";
import { AuthRoutes } from "./modules/auth/auth.route";
import { CompanyRoutes } from "./modules/company/company.route";
import { ContactRoutes } from "./modules/contact/contact.route";
import { DashboardRoutes } from "./modules/dashboard/dashboard.route";
import { GalleryRoutes } from "./modules/gallery/gallery.route";
import { ProjectRoutes } from "./modules/project/project.route";
import { ServiceRoutes } from "./modules/service/service.route";
import { SettingRoutes } from "./modules/setting/setting.route";
import { UserRoutes } from "./modules/user/user.route";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { NewsRoutes } from "./modules/news/news.route";
import { JobRoutes } from "./modules/job/job.route";
import { ApplicationRoutes } from "./modules/application/application.route";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://am-management-web.vercel.app",
  process.env.APP_URL,
].filter(Boolean) as string[];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

// All API'S
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/companies", CompanyRoutes);
app.use("/api/v1/services", ServiceRoutes);
app.use("/api/v1/projects", ProjectRoutes);
app.use("/api/v1/gallery", GalleryRoutes);
app.use("/api/v1/contact", ContactRoutes);
app.use("/api/v1/settings", SettingRoutes);
app.use("/api/v1/dashboard", DashboardRoutes);
app.use("/api/v1/news", NewsRoutes);
app.use("/api/v1/jobs", JobRoutes);
app.use("/api/v1/applications", ApplicationRoutes);

// Testing Route
app.get("/", (req, res) => {
  res.send("AM Management Group Backend Server IS Running...");
});

app.use(globalErrorHandler);

export default app;
