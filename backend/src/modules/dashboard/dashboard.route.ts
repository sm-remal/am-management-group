import { Router } from "express"
import auth, { authorizeRoles } from "../../middleware/auth"
import { DashboardController } from "./dashboard.controller"

const router = Router()

router.get("/", auth, authorizeRoles("ADMIN"), DashboardController.getDashboardOverview)

export const DashboardRoutes = router
