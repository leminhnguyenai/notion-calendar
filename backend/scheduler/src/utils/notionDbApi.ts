import { Client, isFullPage } from "@notionhq/client";
import {
    PageObjectResponse,
    QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";
import path from "path";
import NotionEvent from "../@types/NotionEvent";
import MarkAsDone from "./MarkAsDone";
import FindNotionData from "./findNotionData";
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
        return queryResults.map((unformattedEvent) => {
            const data = new FindNotionData(unformattedEvent);
            let status: string;
            let description: string;
            // If no optional property is included, then status and description will be blank
            if (!optionalProps) {
                status = "";
                description = "";
            } else {
                // Else we will alter description and status based on the query result
                status = optionalProps.doneMethodName
                    ? new MarkAsDone(unformattedEvent).getDoneStatus(
                          optionalProps.doneMethodName,
                          optionalProps.doneMethodOptionId
                      )
                    : "";
                description = optionalProps.descriptionName
                    ? data.getData(optionalProps.descriptionName)
                    : "";
            }
            // Gather and construct formatted notion event
            const formattedEvent: NotionEvent = {
                id: unformattedEvent.id,
                title: status + data.getData(titleName),
                description,
                created_time: unformattedEvent.created_time,
                startDate: data.getData(dateName, "start"),
                endDate: data.getData(dateName, "end"),
            };
            return formattedEvent;
        });
    }
}

(async () => {
    const notionClient = new NotionDbApi();
    console.log(
        await notionClient.getPagesFromDb(
            "fe62e687-5fa5-4b2f-b8cb-8e4bd4a1eb65",
            "Name",
            "Due Date",
            {
                doneMethodName: "Status",
                doneMethodOptionId: "Jqhn",
            }
        )
    );
})();

export default NotionDbApi;
