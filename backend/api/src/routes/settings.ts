import express, { Router } from "express";
import getSettings from "../controllers/settings/getSettings";
import patchSettings from "../controllers/settings/patchSettings";
import settingsErrorHandler from "../middlewares/ErrorHandlers/settingsErrorHandler";
const router: Router = express.Router();

router.use(express.json());

router.get("/", getSettings);
router.patch("/", patchSettings);

router.use(settingsErrorHandler);

export default router;
