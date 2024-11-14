import { NextFunction, Response } from 'express';
import mysql, { Pool } from 'mysql2/promise';
import { CustomRequest, NotionConnection } from '../@types';
import { BaseError } from '../Errors';
import { poolOption } from '../config/db';
import MessageQueue from '../services/messageQueue';
import checkUserExist from './checkUserExist';
import { isNotionConenction } from '../@types/typeGuards';

export const getConnectionsController = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const msgQueue = req.app.get('messageQueue') as MessageQueue;
        const refresh_token: string = req.refresh_token;
        const pool: Pool = mysql.createPool(poolOption(2));

        const user_id: string = await checkUserExist(
            pool,
            msgQueue,
            refresh_token,
        );
        const [connections] = await msgQueue.enqueue(
            pool.query<NotionConnection[]>(
                `SELECT * FROM connections WHERE user_id = ?`,
                [user_id],
            ),
            'db',
        );
        for (const connection of connections) {
            if (!isNotionConenction(connection))
                throw new BaseError('', 'Invalid database data', 400);
        }
        await pool.end();
        res.status(200).json(connections);
    } catch (err) {
        next(err);
    }
};
