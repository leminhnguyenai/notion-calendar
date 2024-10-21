import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import { FormattedConnType } from "../api/src/@types/connections";
import app from "../api/src/app";

describe("Job Queue testing", () => {
    test("High traffic, full values", async () => {
        let successfull: boolean = true;
        let count: number = 0;
        for (let i = 0; i < 30; i++) {
            (async () => {
                const req: FormattedConnType = {
                    calendarId: `calendar_${count + 1}`,
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
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        expect(successfull).toBe(true);
    }, 40000);
    test("Patching 2 calendars", async () => {
        let sucesfull: boolean = true;
        for (let index = 1; index <= 20; index += 10) {
            const updatedCal: FormattedConnType = {
                calendarId: `calendar_${index}`,
                calendarName: `connection ${index}`,
                date: {
                    name: "skibidi",
                    value: "skibidi",
                },
                name: {
                    name: "skibidi",
                    value: "skibidi",
                },
                description: {
                    name: "Chama",
                    value: "Chama",
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
            try {
                const patchRes = await request(app).patch("/connections").send(updatedCal);
                if (patchRes.status !== 200) sucesfull = false;
            } catch (err) {
                console.log(err);
                sucesfull = false;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        expect(sucesfull).toBe(true);
    }, 10000);
    test("Deleting 3 calendars", async () => {
        let sucesfull: boolean = true;
        for (let index = 1; index <= 5; index += 2) {
            const deleteCalId: string = `calendar_${index}`;
            try {
                const delRes = await request(app).delete("/connections").send({
                    calendarId: deleteCalId,
                });
                if (delRes.status !== 200) sucesfull = false;
            } catch (err) {
                console.log(err);
                sucesfull = false;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        expect(sucesfull).toBe(true);
    }, 10000);
});
