import express, { Router } from "express";
import { callback } from "../../controllers/auth/googleAuthController";
const router: Router = express.Router();

router.get("/google/callback", callback);

export default router;
