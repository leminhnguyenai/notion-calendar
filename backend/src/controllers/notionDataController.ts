import { NextFunction, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { Client, isFullDatabase } from '@notionhq/client';
import { BaseError } from '../Errors';
import { CustomRequest } from '../@types';
import MessageQueue from '../services/messageQueue';
dotenv.config({ path: path.join(__dirname, '../../.env') });
const notion = new Client({ auth: process.env.NOTION_KEY });

export const getNotionDataController = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const msgQueue = req.app.get('messageQueue') as MessageQueue;
        const refresh_token: string | undefined = req.refresh_token;
        if (!refresh_token)
            throw new BaseError('', 'Error finding refresh token', 400);
        const response = await msgQueue.enqueue(
            notion.search({
                filter: {
                    value: 'database',
                    property: 'object',
                },
                sort: {
                    direction: 'ascending',
                    timestamp: 'last_edited_time',
                },
            }),
            'fetch_notion',
        );
        const databases: object[] = response.results.map((database) => {
            if (!isFullDatabase(database))
                throw new BaseError(
                    '',
                    'Invalid data type when fetching from Notion',
                    400,
                );
            return {
                databaseName: database.title[0].plain_text,
                databaseId: database.id,
                properties: database.properties,
            };
        });
        res.status(200).json(databases);
    } catch (err) {
        next(err);
    }
};
