import express, { Router } from 'express';
import { callback } from '../../controllers/auth/googleAuthController';
import authErrorHandler from '../../middlewares/error-handlers/authErrorHandler';
const router: Router = express.Router();

router.get('/google/callback', callback);
router.use(authErrorHandler);

export default router;
