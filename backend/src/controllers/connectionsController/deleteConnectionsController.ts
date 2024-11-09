import { NextFunction, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { CustomRequest } from "../../@types";
import { BaseError } from "../../Errors";
import { poolOption } from "../../config/db";
import MessageQueue from "../../services/messageQueue";
import GoogleCalApi from "../../utils/GoogleCalApi";
import checkConnectionExist from "../../utils/checkConnectionExist";
export const deleteConnectionController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const msgQueue = req.app.get("messageQueue") as MessageQueue;
    const refresh_token: string | undefined = req.refresh_token;
    if (!refresh_token)
      throw new BaseError("", "Error finding refresh token", 400);
    const calClient = new GoogleCalApi(refresh_token);
    const connection_id: string = req.body.connection_id;
    const calendar_id: string = req.body.calendar_id;
    const pool: Pool = mysql.createPool(poolOption(2));
    await checkConnectionExist(pool, msgQueue, connection_id);
    await msgQueue.enqueue(
      calClient.deleteCalendar(calendar_id),
      "fetch_google",
    );
    await msgQueue.enqueue(
      pool.query(
        `DELETE FROM connections WHERE connection_id = '${connection_id}'`,
      ),
      "db",
    );
    await pool.end();
    res.status(200).send("Connection deleted successfully");
  } catch (err) {
    next(err);
  }
};
