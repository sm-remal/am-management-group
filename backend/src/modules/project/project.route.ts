import { Router } from "express"
import auth, { authorizeRoles } from "../../middleware/auth"
import validateRequest from "../../middleware/validateRequest"
import { ProjectController } from "./project.controller"
import {
    createProjectImageSchema,
    createProjectSchema,
    updateProjectImageSchema,
    updateProjectSchema,
} from "./project.validation"

const router = Router()

router.get("/", ProjectController.getPublishedProjects)
router.get("/featured", ProjectController.getFeaturedProjects)
router.get("/admin", auth, authorizeRoles("ADMIN"), ProjectController.getAdminProjects)
router.post("/", auth, authorizeRoles("ADMIN"), validateRequest(createProjectSchema), ProjectController.createProject)

router.get("/admin/:id", auth, authorizeRoles("ADMIN"), ProjectController.getAdminProjectById)
router.patch("/admin/:id", auth, authorizeRoles("ADMIN"), validateRequest(updateProjectSchema), ProjectController.updateProject)
router.delete("/admin/:id", auth, authorizeRoles("ADMIN"), ProjectController.deleteProject)

router.post(
    "/admin/:projectId/images",
    auth,
    authorizeRoles("ADMIN"),
    validateRequest(createProjectImageSchema),
    ProjectController.addProjectImage
)
router.patch(
    "/admin/images/:imageId",
    auth,
    authorizeRoles("ADMIN"),
    validateRequest(updateProjectImageSchema),
    ProjectController.updateProjectImage
)
router.delete("/admin/images/:imageId", auth, authorizeRoles("ADMIN"), ProjectController.deleteProjectImage)

router.get("/:slug", ProjectController.getProjectBySlug)

export const ProjectRoutes = router
