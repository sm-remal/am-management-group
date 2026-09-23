import { Router } from "express"
import auth, { authorizeRoles } from "../../middleware/auth"
import validateRequest from "../../middleware/validateRequest"
import { GalleryController } from "./gallery.controller"
import { createGalleryImageSchema, updateGalleryImageSchema } from "./gallery.validation"

const router = Router()

router.get("/", GalleryController.getPublishedGalleryImages)
router.get("/admin", auth, authorizeRoles("ADMIN"), GalleryController.getAdminGalleryImages)
router.post("/", auth, authorizeRoles("ADMIN"), validateRequest(createGalleryImageSchema), GalleryController.createGalleryImage)

router.get("/admin/:id", auth, authorizeRoles("ADMIN"), GalleryController.getAdminGalleryImageById)
router.patch("/admin/:id", auth, authorizeRoles("ADMIN"), validateRequest(updateGalleryImageSchema), GalleryController.updateGalleryImage)
router.delete("/admin/:id", auth, authorizeRoles("ADMIN"), GalleryController.deleteGalleryImage)

router.get("/:id", GalleryController.getPublishedGalleryImageById)

export const GalleryRoutes = router
