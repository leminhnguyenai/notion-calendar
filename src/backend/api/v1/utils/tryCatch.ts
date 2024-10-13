import { Request, Response, NextFunction } from "express";

type TryCatch = (req: Request, res: Response) => Promise<void>;

export const tryCatch =
  (callback: TryCatch) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await callback(req, res);
    } catch (err) {
      return next(err);
    }
  };
