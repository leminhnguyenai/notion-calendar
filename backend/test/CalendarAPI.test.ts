import { describe, expect, test } from "@jest/globals";
import GoogleEvent from "../scheduler/src/@types/googleEvent";
import GoogleCalApi from "../scheduler/src/utils/GoogleCalApi";
const calClient = new GoogleCalApi();
const testCalId =
    "43498232a074f4f051367bbfcc083c3e548262008653b5ee7ada84431070d656@group.calendar.google.com";
let event1Id: string;
let event2Id: string;
describe("Simple editing sequence", () => {
    test("Add events", async () => {
        const event1: GoogleEvent = await calClient.addEvent(
            testCalId,
            "Test event 1",
            "Nothing to see here",
            "2024-10-24T09:00:00Z",
            "2024-10-24T10:30:00Z"
        );
        const event2: GoogleEvent = await calClient.addEvent(
            testCalId,
            "Test event 2",
            "Nothing to see here",
            "2024-10-24T14:00:00Z",
            "2024-10-24T15:15:00Z"
        );
        event1Id = event1.id;
        event2Id = event2.id;
        const eventsToCompare = await calClient.getEvents(testCalId, 25);
        const equal: boolean = JSON.stringify(eventsToCompare) == JSON.stringify([event1, event2]);
        expect(equal).toBe(true);
    });
    test("Update events", async () => {
        const event1: GoogleEvent = await calClient.updateEvent(
            testCalId,
            event1Id,
            "Test event 1",
            "Something to see here",
            "2024-10-24T09:00:00Z",
            "2024-10-24T10:30:00Z"
        );
        const event2: GoogleEvent = await calClient.updateEvent(
            testCalId,
            event2Id,
            "Test event 2 update",
            "Nothing to see here",
            "2024-10-24T14:00:00Z",
            "2024-10-24T15:15:00Z"
        );
        const eventsToCompare = await calClient.getEvents(testCalId, 25);
        const equal: boolean = JSON.stringify(eventsToCompare) == JSON.stringify([event1, event2]);
        expect(equal).toBe(true);
    });
    test("Delete events", async () => {
        await calClient.deleteEvent(testCalId, event1Id);
        await calClient.deleteEvent(testCalId, event2Id);
        const events = await calClient.getEvents(testCalId, 25);
        expect(events.length).toBe(0);
    });
});
