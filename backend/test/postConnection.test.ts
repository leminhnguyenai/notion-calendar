import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import { FormattedConnType } from "../api/src/@types/connections";
import app from "../api/src/app";

describe("Job Queue testing", () => {
    test("Normal traffic, full values", async () => {
        let successfull: boolean = true;
        let count: number = 0;
        for (let i = 0; i < 1000; i++) {
            (async () => {
                const req: FormattedConnType = {
                    calendarId: `${new Date().toISOString()}_${count}`,
                    calendarName: `connection ${count}`,
                    date: {
                        name: "skibidi",
                        value: "skibidi",
                    },
                    name: {
                        name: "skibidi",
                        value: "skibidi",
                    },
                    description: {
                        name: "skibidi",
                        value: "skibidi",
                    },
                    doneMethod: {
                        name: "skibidi",
                        value: "skibidi",
                    },
                    doneMethodOption: {
                        name: "skibidi",
                        value: "skibidi",
                    },
                };
                count++;
                const res = await request(app).post("/connections").send(req);
                if (res.status != 200) successfull = false;
            })();
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        expect(successfull).toBe(true);
    }, 240000);
});
