import { NextFunction, Request, Response } from "express";
import { FormattedConnType } from "../../@types/connections";
import { isFormattedConn } from "../../@types/isFormattedConn";
import { BaseError } from "../../Errors";

const patchConnections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updatedConn: FormattedConnType = JSON.parse(JSON.stringify(req.body));
        if (!isFormattedConn(updatedConn)) throw new BaseError("Invalid input connections", 400);
        if (updatedConn.calendarId == "") throw new BaseError("Calendar ID cannot be empty", 400);
        const response = await fetch("http://localhost:6061/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "CONNECTION",
                method: "PATCH",
                data: updatedConn,
            }),
        });
        if (!response.ok) throw new BaseError(await response.text(), response.status);
        const jsonResponse = await response.json();
        res.status(200).json({
            message: "Updated sucessfully",
            responseData: jsonResponse,
        });
    } catch (err) {
        next(err);
    }
};

export default patchConnections;
