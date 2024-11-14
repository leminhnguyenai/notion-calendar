import { NextFunction, Response } from 'express';
import mysql, { Pool } from 'mysql2/promise';
import { CustomRequest, NotionConnection } from '../../@types';
import { poolOption } from '../../config/db';
import MessageQueue from '../../services/messageQueue';
import GoogleCalApi from '../../utils/GoogleCalApi';
import checkConnectionExist from '../../utils/checkConnectionExist';

export const patchConnectionController = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const msgQueue = req.app.get('messageQueue') as MessageQueue;
        const pool: Pool = mysql.createPool(poolOption(2));
        const refresh_token: string = req.refresh_token;
        const calClient = new GoogleCalApi(refresh_token);
        const connectionToUpdate: NotionConnection = req.body.connection;
        const connection: NotionConnection = await checkConnectionExist(
            pool,
            msgQueue,
            connectionToUpdate.connection_id,
        );

        if (connection.calendar_name !== connectionToUpdate.calendar_name)
            await msgQueue.enqueue(
                calClient.updateCalendar(
                    connectionToUpdate.calendar_id,
                    connectionToUpdate.calendar_name,
                ),
                'fetch_google',
            );
        await msgQueue.enqueue(
            pool.query(
                `
        UPDATE connections SET 
            calendar_name = ?,
            sync_rate = ?,
            statistic = ?,
            db = ?,
            date = ?,
            name = ?,
            description = ?,
            done_method = ?,
            done_method_option = ?
        WHERE connection_id = ?
    `,
                [
                    connectionToUpdate.calendar_name,
                    connectionToUpdate.sync_rate,
                    connectionToUpdate.statistic,
                    JSON.stringify(connectionToUpdate.db),
                    JSON.stringify(connectionToUpdate.date),
                    JSON.stringify(connectionToUpdate.name),
                    JSON.stringify(connectionToUpdate.description || null),
                    JSON.stringify(connectionToUpdate.done_method || null),
                    JSON.stringify(
                        connectionToUpdate.done_method_option || null,
                    ),
                    connectionToUpdate.connection_id,
                ],
            ),
            'db',
        );
        await pool.end();
        res.status(200).send('Connection updated successfully');
    } catch (err) {
        next(err);
    }
};
