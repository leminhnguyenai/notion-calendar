import { NextFunction, Response } from "express";
import mysql, { Pool } from "mysql2/promise";
import { CustomRequest, NotionConnectionSetting } from "../../../@types";
import { BaseError } from "../../../Errors";
import { poolOption } from "../../../config/db";
import MessageQueue from "../../../services/messageQueue";

export const patchConnectionSettingController = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const msgQueue = req.app.get("messageQueue") as MessageQueue;
        const refresh_token: string | undefined = req.refresh_token;
        if (!refresh_token) throw new BaseError("", "Error finding refresh token", 400);
        const connectionSettingToUpdate: NotionConnectionSetting = req.body.setting;
        const pool: Pool = mysql.createPool(poolOption(2));
        const [settings] = await msgQueue.enqueue(
            () =>
                pool.query<NotionConnectionSetting[]>(`
      SELECT sync_rate, statistic FROM connection_settings 
      WHERE calendar_id = '${connectionSettingToUpdate.calendar_id}'
    `),
            "db"
        );
        if (settings.length !== 1) throw new BaseError("", "Error finding connection setting", 400);
        await msgQueue.enqueue(
            () =>
                pool.query(`
      UPDATE connection_settings SET
        sync_rate = '${connectionSettingToUpdate.sync_rate}',
        statistic = '${connectionSettingToUpdate.statistic}'
      WHERE calendar_id = '${connectionSettingToUpdate.calendar_id}'
    `),
            "db"
        );
        res.status(200).send("Connection setting updated successfully");
    } catch (err) {
        next(err);
    }
};
