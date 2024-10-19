import { BaseError, SqlError } from "../../Errors";
import { Request, Response, NextFunction } from "express";

const connectionsErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    if (err instanceof BaseError) {
        res.status(err.statusCode).send(err.message);
    } else if (err instanceof SqlError) {
        res.status(err.statusCode).send(err.message);
    } else res.status(400).send(err.message);
    next();
};

export default connectionsErrorHandler;
