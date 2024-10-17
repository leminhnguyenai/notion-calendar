import { expect, describe, test } from "@jest/globals";
import isJob from "../types-guard/isJob";

describe("job type guard testing", () => {
    test("Connection Post", () => {
        const req = {
            type: "CONNECTION",
            method: "POST",
            data: {},
        };
        expect(isJob(req)).toBe(true);
    });
});
