import { BaseError } from "../Error";
import { Request, Response, NextFunction } from "express";

export const connectionsErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);
  if (err instanceof BaseError) {
    res.status(err.statusCode).send(err.message);
  } else res.status(400).send(err.message);
  next();
};
