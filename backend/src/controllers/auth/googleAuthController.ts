import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import path from "path";
import { URL } from "url";
import { BaseError } from "../../Errors";
import { PORT } from "../../server";
import saveUserInfo from "../../services/saveUserInfo";
dotenv.config({ path: path.join(__dirname, "../../../.env") });

export const callback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const qs = new URL(req.url, `http://localhost:${PORT}`).searchParams;
        const code = qs.get("code");
        if (code === null) throw new BaseError("", "Error getting code from consent screen", 400);
        await saveUserInfo(code);
        res.status(200).send("Authentication succeed");
    } catch (err) {
        next(err);
    }
};
