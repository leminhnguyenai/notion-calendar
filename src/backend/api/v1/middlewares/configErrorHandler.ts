import { BaseError } from "../Error";
import { Request, Response, NextFunction } from "express";

export const configErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof BaseError) {
    console.log(err);
    res.status(err.statusCode).send(err.message);
    next();
  }
  console.log(err);
  res.status(400).send(err.message);
  next();
};
