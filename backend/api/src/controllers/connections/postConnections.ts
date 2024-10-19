import { NextFunction, Request, Response } from "express";
import { FormattedConnType } from "../../@types/connections";
import { isFormattedConn } from "../../@types/isFormattedConn";
import { BaseError } from "../../Errors";

const postConnections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const newConn: FormattedConnType = JSON.parse(JSON.stringify(req.body));
        if (!isFormattedConn(newConn)) throw new BaseError("Invalid input connections", 400);
        const response = await fetch("http://localhost:6061/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "CONNECTION",
                method: "POST",
                data: newConn,
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

export default postConnections;
