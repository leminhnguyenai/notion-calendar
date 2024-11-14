import express, { Router } from 'express';
import notionDataErrorHandler from '../../middlewares/error-handlers/notionDataErrorHandler';
import { getNotionDataController } from '../../controllers/notionDataController';
import refreshTokenValidate from '../../middlewares/refreshTokenValidate';
const router: Router = express.Router();

router.use(refreshTokenValidate);
router.get('/', getNotionDataController);
router.use(notionDataErrorHandler);

export default router;
