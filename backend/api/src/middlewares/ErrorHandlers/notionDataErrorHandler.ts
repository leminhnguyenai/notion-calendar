import { NextFunction, Request, Response } from "express";
import { BaseError } from "../../Errors";

const notionDataErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    if (err instanceof BaseError) {
        res.status(err.statusCode).send(err.message);
    } else res.status(400).send(err.message);
    next();
};

export default notionDataErrorHandler;
