import { NextFunction, Request, Response } from "express";
import { BaseError } from "../../Errors";

const deleteconnections = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const deletedCalendarId: string = req.body.calendarId;
        if (deletedCalendarId == "") throw new BaseError("Calendar ID cannot be empty", 400);
        const response = await fetch("http://localhost:6061/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "CONNECTION",
                method: "DELETE",
                data: req.body,
            }),
        });
        if (!response.ok) throw new BaseError(await response.text(), response.status);
        const jsonResponse = await response.json();
        res.status(200).json({
            message: "Deleted sucessfully",
            responseData: jsonResponse,
        });
    } catch (err) {
        next(err);
    }
};

export default deleteconnections;
