import express, { Router } from "express";
import { patchConnectionSettingController } from "../../controllers/connectionsController";
const router: Router = express.Router();

router.patch("/", patchConnectionSettingController);

export default router;
