import { Router } from "express";
import { AuthController } from "./auth.controller";
import {
    changePasswordSchema,
    forgotPasswordSchema,
    googleAuthSchema,
    loginSchema,
    refreshTokenSchema,
    registerSchema,
    resetPasswordSchema,
} from "./auth.validation";
import validateRequest from "../../middleware/validateRequest";
import auth from "../../middleware/auth";


const router = Router();

router.post("/register", validateRequest(registerSchema), AuthController.register);
router.post("/login", validateRequest(loginSchema), AuthController.login);
router.post("/google", validateRequest(googleAuthSchema), AuthController.googleAuth);
router.post("/forgot-password", validateRequest(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", validateRequest(resetPasswordSchema), AuthController.resetPassword);
router.post("/change-password", auth, validateRequest(changePasswordSchema), AuthController.changePassword);
router.post("/refresh-token", validateRequest(refreshTokenSchema), AuthController.refreshToken);
router.get("/me", auth, AuthController.me);
router.post("/logout", auth, AuthController.logout);

export const AuthRoutes = router;
