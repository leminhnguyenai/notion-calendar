import { NextFunction, Request, Response } from "express";
import isSetting from "../../@types/isSetting";
import { BaseError } from "../../Errors";

const patchSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const newSetting = req.body;
        if (!isSetting(newSetting)) throw new BaseError("Invalid setting input", 400);
        const response = await fetch("http://localhost:6061/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "CONFIG",
                method: "PATCH",
                data: newSetting,
            }),
        });
        if (!response.ok) throw new BaseError(await response.text(), response.status);
        const jsonResponse = await response.json();
        res.status(200).json({
            message: "Added sucessfully",
            responseData: jsonResponse,
        });
    } catch (err) {
        next(err);
    }
};
export default patchSettings;
