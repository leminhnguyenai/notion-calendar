import express, { Router } from "express";
import getConnections from "../controllers/connections/getConnections";
import patchConnections from "../controllers/connections/patchConnections";
import postConnections from "../controllers/connections/postConnections";
const router: Router = express.Router();

router.use(express.json());

router.get("/", getConnections);
router.post("/", postConnections);
router.patch("/", patchConnections);

export default router;
