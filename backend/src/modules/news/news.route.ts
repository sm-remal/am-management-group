import { Router } from "express"
import auth, { authorizeRoles } from "../../middleware/auth"
import validateRequest from "../../middleware/validateRequest"
import { NewsController } from "./news.controller"
import { createNewsSchema, updateNewsSchema } from "./news.validation"

const router = Router()

router.get("/", NewsController.getPublishedNews)
router.get("/admin", auth, authorizeRoles("ADMIN"), NewsController.getAdminNews)
router.post("/", auth, authorizeRoles("ADMIN"), validateRequest(createNewsSchema), NewsController.createNews)

router.get("/admin/:id", auth, authorizeRoles("ADMIN"), NewsController.getAdminNewsById)
router.patch("/admin/:id", auth, authorizeRoles("ADMIN"), validateRequest(updateNewsSchema), NewsController.updateNews)
router.delete("/admin/:id", auth, authorizeRoles("ADMIN"), NewsController.deleteNews)

router.get("/:slug", NewsController.getNewsBySlug)

export const NewsRoutes = router
