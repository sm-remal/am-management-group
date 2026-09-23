import { Router } from "express"
import auth, { authorizeRoles } from "../../middleware/auth"
import validateRequest from "../../middleware/validateRequest"
import { SettingController } from "./setting.controller"
import { createSettingSchema, updateSettingSchema, upsertSettingsSchema } from "./setting.validation"

const router = Router()

router.get("/", SettingController.getAllSettings)
router.get("/map", SettingController.getSettingsMap)

router.get("/admin", auth, authorizeRoles("ADMIN"), SettingController.getAllSettings)
router.post("/", auth, authorizeRoles("ADMIN"), validateRequest(createSettingSchema), SettingController.createSetting)
router.put("/admin/bulk", auth, authorizeRoles("ADMIN"), validateRequest(upsertSettingsSchema), SettingController.upsertSettings)

router.get("/admin/:id", auth, authorizeRoles("ADMIN"), SettingController.getSettingById)
router.patch("/admin/:id", auth, authorizeRoles("ADMIN"), validateRequest(updateSettingSchema), SettingController.updateSetting)
router.delete("/admin/:id", auth, authorizeRoles("ADMIN"), SettingController.deleteSetting)

router.get("/:key", SettingController.getSettingByKey)

export const SettingRoutes = router
