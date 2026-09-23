import { Router } from "express"
import auth, { authorizeRoles } from "../../middleware/auth"
import validateRequest from "../../middleware/validateRequest"
import { CompanyController } from "./company.controller"
import { createCompanySchema, updateCompanySchema } from "./company.validation"

const router = Router()

router.get("/", CompanyController.getPublishedCompanies)
router.get("/admin", auth, authorizeRoles("ADMIN"), CompanyController.getAdminCompanies)
router.post("/", auth, authorizeRoles("ADMIN"), validateRequest(createCompanySchema), CompanyController.createCompany)

router.get("/admin/:id", auth, authorizeRoles("ADMIN"), CompanyController.getAdminCompanyById)
router.patch("/admin/:id", auth, authorizeRoles("ADMIN"), validateRequest(updateCompanySchema), CompanyController.updateCompany)
router.delete("/admin/:id", auth, authorizeRoles("ADMIN"), CompanyController.deleteCompany)

router.get("/:slug", CompanyController.getCompanyBySlug)

export const CompanyRoutes = router
