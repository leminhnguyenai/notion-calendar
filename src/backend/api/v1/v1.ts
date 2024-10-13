import { Router } from "express";
import { connections } from "./routes/connections";
const router: Router = Router();

router.use("/connections", connections);

export const v1 = router;
