import { Router } from "express"
import auth, { authorizeRoles } from "../../middleware/auth"
import validateRequest from "../../middleware/validateRequest"
import { ContactController } from "./contact.controller"
import { createInquirySchema, updateInquirySchema, updateInquiryStatusSchema } from "./contact.validation"

const router = Router()

router.post("/", validateRequest(createInquirySchema), ContactController.createInquiry)

router.get("/admin", auth, authorizeRoles("ADMIN"), ContactController.getAllInquiries)
router.get("/admin/:id", auth, authorizeRoles("ADMIN"), ContactController.getInquiryById)
router.patch("/admin/:id", auth, authorizeRoles("ADMIN"), validateRequest(updateInquirySchema), ContactController.updateInquiry)
router.patch(
    "/admin/:id/status",
    auth,
    authorizeRoles("ADMIN"),
    validateRequest(updateInquiryStatusSchema),
    ContactController.updateInquiryStatus
)
router.delete("/admin/:id", auth, authorizeRoles("ADMIN"), ContactController.deleteInquiry)

export const ContactRoutes = router
