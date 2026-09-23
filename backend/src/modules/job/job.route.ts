import { Router } from "express"
import auth, { authorizeRoles } from "../../middleware/auth"
import validateRequest from "../../middleware/validateRequest"
import { JobController } from "./job.controller"
import { createJobSchema, updateJobSchema } from "./job.validation"

const router = Router()

router.get("/", JobController.getPublishedJobs)
router.get("/admin", auth, authorizeRoles("ADMIN"), JobController.getAdminJobs)
router.post("/", auth, authorizeRoles("ADMIN"), validateRequest(createJobSchema), JobController.createJob)

router.get("/admin/:id", auth, authorizeRoles("ADMIN"), JobController.getAdminJobById)
router.patch("/admin/:id", auth, authorizeRoles("ADMIN"), validateRequest(updateJobSchema), JobController.updateJob)
router.delete("/admin/:id", auth, authorizeRoles("ADMIN"), JobController.deleteJob)

router.get("/:slug", JobController.getJobBySlug)

export const JobRoutes = router
