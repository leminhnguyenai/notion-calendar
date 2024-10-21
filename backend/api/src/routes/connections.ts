import express, { Router } from "express";
import deleteconnections from "../controllers/connections/deleteConnections";
import getConnections from "../controllers/connections/getConnections";
import patchConnections from "../controllers/connections/patchConnections";
import postConnections from "../controllers/connections/postConnections";
import connectionsErrorHandler from "../middlewares/ErrorHandlers/connectionsErrorHandler";
const router: Router = express.Router();

router.use(express.json());

router.get("/", getConnections);
router.post("/", postConnections);
router.patch("/", patchConnections);
router.delete("/", deleteconnections);

router.use(connectionsErrorHandler);

export default router;
