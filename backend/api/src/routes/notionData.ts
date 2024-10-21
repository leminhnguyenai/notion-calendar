import express, { Router } from "express";
import getNotionData from "../controllers/notionData/getNotionData";
const router: Router = express.Router();

router.get("/", getNotionData);

export default router;
