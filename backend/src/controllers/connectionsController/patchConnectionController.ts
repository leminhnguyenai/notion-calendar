import { NextFunction, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { CustomRequest, NotionConnection } from "../../@types";
import { BaseError } from "../../Errors";
import { poolOption } from "../../config/db";
import MessageQueue from "../../services/messageQueue";
import GoogleCalApi from "../../utils/GoogleCalApi";
import checkConnectionExist from "../../utils/checkConnectionExist";

export const patchConnectionController = async (
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
    const connectionToUpdate: NotionConnection = req.body.connection;
    const pool: Pool = mysql.createPool(poolOption(2));
    await checkConnectionExist(
      pool,
      msgQueue,
      connectionToUpdate.connection_id,
    );
    await msgQueue.enqueue(
      calClient.updateCalendar(
        connectionToUpdate.calendar_id,
        connectionToUpdate.calendar_name,
      ),
      "fetch_google",
    );
    await msgQueue.enqueue(
      pool.query(`
        UPDATE connections SET 
            calendar_name = '${connectionToUpdate.calendar_name}',
            date = '${JSON.stringify(connectionToUpdate.date)}',
            name = '${JSON.stringify(connectionToUpdate.name)}',
            description = '${JSON.stringify(connectionToUpdate.description)}',
            done_method = '${JSON.stringify(connectionToUpdate.done_method)}',
            done_method_option = '${JSON.stringify(connectionToUpdate.done_method_option)}',
			next_execution_time = '${connectionToUpdate.next_execution_time}',
			statistic = '${connectionToUpdate.statistic}',
			sync_rate = ${connectionToUpdate.sync_rate}
        WHERE connection_id = '${connectionToUpdate.connection_id}'
    `),
      "db",
    );
    await pool.end();
    res.status(200).send("Connection updated successfully");
  } catch (err) {
    next(err);
  }
};
