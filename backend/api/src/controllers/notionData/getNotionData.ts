import { Client, isFullDatabase } from "@notionhq/client";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import path from "path";
import { BaseError } from "../../Errors";
dotenv.config({ path: path.join(__dirname, "../../../../config/.env") });
const notion = new Client({ auth: process.env.NOTION_KEY });

const getNotionData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await notion.search({
            filter: {
                value: "database",
                property: "object",
            },
            sort: {
                direction: "ascending",
                timestamp: "last_edited_time",
            },
        });
        const data = response.results.map((result) => {
            if (!isFullDatabase(result)) throw new BaseError("Invalid database result", 400);
            return {
                databaseName: result.title[0].plain_text,
                databaseId: result.id,
                properties: result.properties,
            };
        });
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

export default getNotionData;
