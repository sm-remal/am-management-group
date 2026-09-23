import { Router } from "express"
import auth, { authorizeRoles } from "../../middleware/auth"
import validateRequest from "../../middleware/validateRequest"
import { ServiceController } from "./service.controller"
import { createServiceSchema, updateServiceSchema } from "./service.validation"

const router = Router()

router.get("/", ServiceController.getPublishedServices)
router.get("/admin", auth, authorizeRoles("ADMIN"), ServiceController.getAdminServices)
router.post("/", auth, authorizeRoles("ADMIN"), validateRequest(createServiceSchema), ServiceController.createService)

router.get("/admin/:id", auth, authorizeRoles("ADMIN"), ServiceController.getAdminServiceById)
router.patch("/admin/:id", auth, authorizeRoles("ADMIN"), validateRequest(updateServiceSchema), ServiceController.updateService)
router.delete("/admin/:id", auth, authorizeRoles("ADMIN"), ServiceController.deleteService)

router.get("/:companySlug/:slug", ServiceController.getServiceByCompanyAndSlug)

export const ServiceRoutes = router
