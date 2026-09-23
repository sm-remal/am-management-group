import { Router } from "express"
import auth, { authorizeRoles } from "../../middleware/auth"
import validateRequest from "../../middleware/validateRequest"
import { UserController } from "./user.controller"
import {
    createUserSchema,
    updateProfileSchema,
    updateUserSchema,
    updateUserStatusSchema,
} from "./user.validation"

const router = Router()

router.get("/", auth, authorizeRoles("ADMIN"), UserController.getAllUsers)
router.post("/", auth, authorizeRoles("ADMIN"), validateRequest(createUserSchema), UserController.createUser)

router.patch("/profile/me", auth, validateRequest(updateProfileSchema), UserController.updateMyProfile)

router.get("/:id", auth, authorizeRoles("ADMIN"), UserController.getUserById)
router.patch("/:id", auth, authorizeRoles("ADMIN"), validateRequest(updateUserSchema), UserController.updateUser)
router.patch("/:id/status", auth, authorizeRoles("ADMIN"), validateRequest(updateUserStatusSchema), UserController.updateUserStatus)
router.delete("/:id", auth, authorizeRoles("ADMIN"), UserController.deleteUser)

export const UserRoutes = router
