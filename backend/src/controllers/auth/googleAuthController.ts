import dotenv from 'dotenv';
import { NextFunction, Response } from 'express';
import path from 'path';
import { URL } from 'url';
import { CustomRequest } from '../../@types';
import { BaseError } from '../../Errors';
import { PORT } from '../../server';
import MessageQueue from '../../services/messageQueue';
import saveUserInfo from '../../utils/saveUserInfo';
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const callback = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const qs = new URL(req.url, `http://localhost:${PORT}`).searchParams;
        const code = qs.get('code');
        if (code === null)
            throw new BaseError(
                '',
                'Error getting code from consent screen',
                400,
            );
        await saveUserInfo(code, req.app.get('messageQueue') as MessageQueue);
        res.status(200).send('Authentication succeed');
    } catch (err) {
        next(err);
    }
};
