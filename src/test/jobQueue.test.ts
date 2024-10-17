import { describe, expect, test } from "@jest/globals";
import { FormattedConnType } from "../@types/sql";
import request from "supertest";
import app from "../backend/api/app";

describe("Job Queue testing", () => {
    test("Normal traffic, full values", async () => {
        let successfull: boolean = true;
        let count: number = 0;
        for (let i = 0; i < 10; i++) {
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
                const res = await request(app).post("/api/v1/connections").send(req);
                if (res.status != 200) successfull = false;
            })();
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        expect(successfull).toBe(true);
    }, 240000);
});
