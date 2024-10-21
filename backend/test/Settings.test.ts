import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../api/src/app";

describe("Setting testing", () => {
    test("Change settings, normal rate", async () => {
        const newSetting = {
            user_id: 1,
            refresh_rate: 30000,
        };
        const patchRes = await request(app).patch("/settings").send(newSetting);
        expect(patchRes.status).toBe(200);
        const getRes = await request(app).get("/settings");
        expect(JSON.parse(getRes.text)).toMatchObject(newSetting);
    }, 1000);
});
