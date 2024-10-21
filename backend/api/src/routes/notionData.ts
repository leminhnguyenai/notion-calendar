import express, { Router } from "express";
import getNotionData from "../controllers/notionData/getNotionData";
import notionDataErrorHandler from "../middlewares/ErrorHandlers/notionDataErrorHandler";
const router: Router = express.Router();

router.get("/", getNotionData);

router.use(notionDataErrorHandler);

export default router;
