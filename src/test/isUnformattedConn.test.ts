import { isUnformattedConn } from "../backend/api/v1/utils/isUnformattedConn";
import { describe, expect, test } from "@jest/globals";

describe("type guard for unformatted connections", () => {
  test("Missing description, doneMethod and doneMethodOption", () => {
    expect(
      isUnformattedConn({
        calendar_id:
          "e6f352d04935bd2e95f3d4c8a8f70b7eb3ef1a0788956694458def155e8f3dbd@group.calendar.google.com",
        calendar_name: "Notion projects",
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
        description: null,
        done_method: null,
        done_method_option: null,
      })
    ).toBe(false);
  });
  test("Full connections", () => {
    expect(
      isUnformattedConn({
        calendar_id:
          "e6f352d04935bd2e95f3d4c8a8f70b7eb3ef1a0788956694458def155e8f3dbd@group.calendar.google.com",
        calendar_name: "Notion projects",
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
        done_method: {
          name: "Done",
          value: "345",
        },
        done_method_option: {
          name: "Done",
          value: "567",
        },
      })
    ).toBe(true);
  });
});
