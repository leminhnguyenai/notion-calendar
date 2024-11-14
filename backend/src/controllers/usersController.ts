import { NextFunction, Request, Response } from 'express';
import generateConsentScreen from '../utils/generateConsentScreenUrl';

export const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const consentScreenUrl: string = generateConsentScreen();
        res.status(200).json({
            url: consentScreenUrl,
        });
    } catch (err) {
        next(err);
    }
};
