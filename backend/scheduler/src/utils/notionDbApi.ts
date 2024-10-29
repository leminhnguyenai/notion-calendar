import { Client, isFullPage } from "@notionhq/client";
import {
    PageObjectResponse,
    QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";
import path from "path";
import NotionEvent from "../@types/NotionEvent";
import formatToNotionEvents from "./formatToNotionEvent";
dotenv.config({ path: path.join(__dirname, "../../../config/.env") });
const notion = new Client({ auth: process.env.NOTION_KEY });

type OptionalProps = {
    descriptionName?: string;
    doneMethodName?: string;
    doneMethodOptionId?: string;
};

interface notionDbApiType {
    getPagesFromDb(
        dbId: string,
        titleName: string,
        dateName: string,
        optionalProps?: OptionalProps
    ): Promise<NotionEvent[]>;
}

class NotionDbApi implements notionDbApiType {
    async getPagesFromDb(
        dbId: string,
        titleName: string,
        dateName: string,
        optionalProps?: OptionalProps
    ): Promise<NotionEvent[]> {
        let nextCursor: string | null = null;
        let hasMore: boolean = true;
        let queryResults: PageObjectResponse[] = [];
        // Create a while loop that will keep querying the database until it fetch everything
        while (hasMore) {
            const queryToSend: QueryDatabaseParameters = {
                database_id: dbId,
                filter: { property: dateName, date: { is_not_empty: true } },
                sorts: [{ property: dateName, direction: "ascending" }],
                page_size: 100,
            };
            if (nextCursor !== null) queryToSend.start_cursor = nextCursor;
            const data = await notion.databases.query(queryToSend);
            hasMore = data.has_more;
            nextCursor = data.next_cursor;
            // filter the querying result to only contain pages
            const filteredData: PageObjectResponse[] = data.results
                .filter((result) => isFullPage(result))
                .map((result) => result as PageObjectResponse);
            queryResults = queryResults.concat(filteredData);
        }
        // return a formatted version of notion events
        return queryResults.map((unformattedEvent) =>
            formatToNotionEvents(unformattedEvent, dateName, titleName, optionalProps)
        );
    }
}

export default NotionDbApi;
