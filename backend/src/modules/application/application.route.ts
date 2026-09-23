import { Router } from "express"
import auth, { authorizeRoles } from "../../middleware/auth"
import validateRequest from "../../middleware/validateRequest"
import { ApplicationController } from "./application.controller"
import {
    createApplicationSchema,
    updateApplicationSchema,
    updateApplicationStatusSchema,
} from "./application.validation"

const router = Router()

// Public - job seekers submit applications
router.post("/", validateRequest(createApplicationSchema), ApplicationController.createApplication)

// Admin only
router.get("/admin", auth, authorizeRoles("ADMIN"), ApplicationController.getAllApplications)
router.get("/admin/:id", auth, authorizeRoles("ADMIN"), ApplicationController.getApplicationById)
router.patch(
    "/admin/:id",
    auth,
    authorizeRoles("ADMIN"),
    validateRequest(updateApplicationSchema),
    ApplicationController.updateApplication
)
router.patch(
    "/admin/:id/status",
    auth,
    authorizeRoles("ADMIN"),
    validateRequest(updateApplicationStatusSchema),
    ApplicationController.updateApplicationStatus
)
router.delete("/admin/:id", auth, authorizeRoles("ADMIN"), ApplicationController.deleteApplication)

export const ApplicationRoutes = router
