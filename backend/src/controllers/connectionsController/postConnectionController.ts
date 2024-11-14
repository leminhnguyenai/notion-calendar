import bcrypt from 'bcrypt';
import { NextFunction, Response } from 'express';
import mysql, { Pool } from 'mysql2/promise';
import { CustomRequest, NewNotionConnection } from '../../@types';
import { poolOption } from '../../config/db';
import MessageQueue from '../../services/messageQueue';
import GoogleCalApi from '../../utils/GoogleCalApi';
import checkUserExist from '../../utils/checkUserExist';

export const postConnectionController = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const msgQueue = req.app.get('messageQueue') as MessageQueue;
        const refresh_token: string = req.refresh_token;
        const calClient = new GoogleCalApi(refresh_token);
        const newConnection: NewNotionConnection = req.body.connection;
        const pool: Pool = mysql.createPool(poolOption(2));

        const user_id: string = await checkUserExist(
            pool,
            msgQueue,
            refresh_token,
        );
        const calendarId = await msgQueue.enqueue(
            calClient.createCalendar(newConnection.calendar_name),
            'fetch_google',
        );
        const connection_id: string = await bcrypt.hash(calendarId, 10);
        const next_execution_time = new Date();
        next_execution_time.setTime(
            next_execution_time.getTime() + (newConnection.sync_rate || 120000),
        );
        await msgQueue.enqueue(
            pool.query(
                `
            INSERT INTO connections(
                connection_id,
                calendar_id,
                user_id,
                calendar_name,
                sync_rate,
                statistic,
                next_execution_time,
                db,
                name,
                date,
                description,
                done_method,
                done_method_option
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        `,
                [
                    connection_id,
                    calendarId,
                    user_id,
                    newConnection.calendar_name,
                    newConnection.sync_rate || 120000,
                    newConnection.statistic || 1,
                    next_execution_time.toISOString(),
                    JSON.stringify(newConnection.db),
                    JSON.stringify(newConnection.name),
                    JSON.stringify(newConnection.date),
                    JSON.stringify(newConnection.description || null),
                    JSON.stringify(newConnection.done_method || null),
                    JSON.stringify(newConnection.done_method_option || null),
                ],
            ),
            'db',
        );
        //* Add commands to communicate the change to the according worker
        await pool.end();
        res.status(200).send('Connection created successfully');
    } catch (err) {
        next(err);
    }
};
