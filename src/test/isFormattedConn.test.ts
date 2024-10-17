import { isFormattedConn } from "../types-guard/isFormattedConn";
import { describe, expect, test } from "@jest/globals";

describe("type guard for formatted connections", () => {
    test("Missing description, doneMethod and doneMethodOption", () => {
        expect(
            isFormattedConn({
                calendarId:
                    "e6f352d04935bd2e95f3d4c8a8f70b7eb3ef1a0788956694458def155e8f3dbd@group.calendar.google.com",
                calendarName: "Notion projects",
                date: {
                    date: {
                        name: "Due Date",
                        value: "eD%3DI",
                    },
                },
                name: {
                    name: {
                        name: "Name",
                        value: "title",
                    },
                },
            })
        ).toBe(false);
    });
    test("Full connections", () => {
        expect(
            isFormattedConn({
                calendarId:
                    "e6f352d04935bd2e95f3d4c8a8f70b7eb3ef1a0788956694458def155e8f3dbd@group.calendar.google.com",
                calendarName: "Notion projects",
                date: {
                    name: "Due Date",
                    value: "eD%3DI",
                },

                name: {
                    name: "Name",
                    value: "title",
                },
                description: {
                    name: "Notes",
                    value: "123",
                },
                doneMethod: {
                    name: "Done",
                    value: "345",
                },
                doneMethodOption: {
                    name: "Done",
                    value: "567",
                },
            })
        ).toBe(true);
    });
});
