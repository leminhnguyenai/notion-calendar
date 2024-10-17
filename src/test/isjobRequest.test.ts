import { expect, describe, test } from "@jest/globals";
import isJobRequest from "../types-guard/isJobRequest";

describe("job type guard testing", () => {
    test("Sucessfull request", () => {
        const req = {
            id: 1,
            job: {
                type: "CONNECTION",
                method: "POST",
                data: {},
            },
            status: 200,
            responseData: {},
        };
        expect(isJobRequest(req)).toBe(true);
    });
    test("Failed request", () => {
        const req = {
            id: 1,
            job: {
                type: "CONNECTION",
                method: "POST",
                data: {},
            },
            status: 400,
            error: "Skibidi",
        };
        expect(isJobRequest(req)).toBe(true);
    });
    test("Sending request (invalid type)", () => {
        const req = {
            id: 1,
            job: {
                type: "CONNECTION",
                method: "POST",
                data: {},
            },
            status: 0,
            error: "Skibidi",
        };
        expect(isJobRequest(req)).toBe(false);
    });
    test("Sending request (valid type)", () => {
        const req = {
            id: 1,
            job: {
                type: "CONNECTION",
                method: "POST",
                data: {},
            },
            status: 0,
        };
        expect(isJobRequest(req)).toBe(true);
    });
});
