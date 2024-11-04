import express, { Router } from "express";
import {
    deleteConnectionController,
    getConnectionsController,
    patchConnectionController,
    postConnectionController,
} from "../../controllers/connectionsController";
import connectionsErrorHandler from "../../middlewares/error-handlers/connectionsErrorHandler";
import refreshTokenValidate from "../../middlewares/refreshTokenValidate";
import connectionSettings from "./connectionSettings";
const router: Router = express.Router();

router.use(express.json());
router.use(refreshTokenValidate);
//* Learn and add JSON schema validation later as middlewares
router.get("/", getConnectionsController);
router.post("/", postConnectionController);
router.patch("/", patchConnectionController);
router.delete("/", deleteConnectionController);
router.use("/settings", connectionSettings);
router.use(connectionsErrorHandler);

export default router;
