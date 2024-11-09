import bcrypt from "bcrypt";
import { NextFunction, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { CustomRequest, NewNotionConnection } from "../../@types";
import { BaseError } from "../../Errors";
import { poolOption } from "../../config/db";
import MessageQueue from "../../services/messageQueue";
import GoogleCalApi from "../../utils/GoogleCalApi";
import checkUserExist from "../../utils/checkUserExist";

export const postConnectionController = async (
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
    const newConnection: NewNotionConnection = req.body.connection;
    const pool: Pool = mysql.createPool(poolOption(2));
    const user_id: string = await checkUserExist(pool, msgQueue, refresh_token);
    const description = newConnection.description || null;
    const done_method = newConnection.done_method || null;
    const done_method_option = newConnection.done_method_option || null;
    const sync_rate: number = newConnection.sync_rate || 120000;
    const statistic: "system" | "dark" | "light" =
      newConnection.statistic || "system";
    const calendarId = await msgQueue.enqueue(
      calClient.createCalendar(newConnection.calendar_name),
      "fetch_google",
    );
    const connection_id: string = await bcrypt.hash(calendarId, 10);
    const next_execution_time = new Date();
    next_execution_time.setTime(next_execution_time.getTime() + 120000);
    await msgQueue.enqueue(
      pool.query(`
            INSERT INTO connections VALUES (
                '${connection_id}',
                '${calendarId}',
                '${user_id}',
                '${newConnection.calendar_name}',
                '${JSON.stringify(newConnection.name)}',
                '${JSON.stringify(newConnection.date)}',
                '${JSON.stringify(description)}',
                '${JSON.stringify(done_method)}',
                '${JSON.stringify(done_method_option)}',
				'${next_execution_time.toISOString()}',
				'${statistic}',
				${sync_rate}
            )
        `),
      "db",
    );
    //* Add commands to communicate the change to the according worker
    await pool.end();
    res.status(200).send("Connection created successfully");
  } catch (err) {
    next(err);
  }
};
