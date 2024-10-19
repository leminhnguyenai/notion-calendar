import express, { Router } from "express";
import getConnections from "../controllers/connections/getConnections";
import postConnections from "../controllers/connections/postConnections";
const router: Router = express.Router();

router.use(express.json());

router.get("/", getConnections);
router.post("/", postConnections);

export default router;
