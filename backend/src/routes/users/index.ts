import express, { Router } from "express";
import { loginUser } from "../../controllers/usersController";
const router: Router = express.Router();

router.use(express.json());

router.post("/login", loginUser);

export default router;
