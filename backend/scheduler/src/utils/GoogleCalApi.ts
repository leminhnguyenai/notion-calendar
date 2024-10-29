import { OAuth2Client } from "google-auth-library";
import { calendar_v3, google } from "googleapis";
import GoogleEvent from "../@types/googleEvent";
import { BaseError } from "../Errors";
import formattToGoogleEvent from "./formatToGoogleEvent";
import getAuthenticationClient from "./getAuthenticationClient";

interface GoogleCalApiType {
    createCalendar(title: string): Promise<string>;
    updateCalendar(calId: string, title: string): Promise<void>;
    deleteCalendar(calId: string): Promise<void>;
    getEvents(calId: string, maxResults: number): Promise<GoogleEvent[]>;
    addEvent(
        calId: string,
        title: string,
        description: string,
        startDate: string,
        endDate: string
    ): Promise<GoogleEvent>;
    updateEvent(
        calId: string,
        evId: string,
        title: string,
        description: string,
        startDate: string,
        endDate: string
    ): Promise<GoogleEvent>;
    deleteEvent(calId: string, evId: string): Promise<void>;
}

class GoogleCalApi implements GoogleCalApiType {
    private client: OAuth2Client | undefined;
    constructor() {
        this.client = undefined;
    }

    async createCalendar(title: string): Promise<string> {
        if (!this.client) this.client = await getAuthenticationClient();
        const calendar = google.calendar({ version: "v3", auth: this.client });
        const res = await calendar.calendars.insert({
            requestBody: { summary: title },
        });
        const calId = res.data.id;
        if (!calId) throw new BaseError("Error getting calendar Id", 400);
        return calId;
    }

    async updateCalendar(calId: string, title: string): Promise<void> {
        if (!this.client) this.client = await getAuthenticationClient();
        const calendar = google.calendar({ version: "v3", auth: this.client });
        await calendar.calendars.update({
            calendarId: calId,
            requestBody: { summary: title },
        });
    }

    async deleteCalendar(calId: string): Promise<void> {
        if (!this.client) this.client = await getAuthenticationClient();
        const calendar = google.calendar({ version: "v3", auth: this.client });
        await calendar.calendars.delete({
            calendarId: calId,
        });
    }

    async getEvents(calId: string, maxResults: number): Promise<GoogleEvent[]> {
        if (!this.client) this.client = await getAuthenticationClient();
        const calendar = google.calendar({ version: "v3", auth: this.client });
        const res = await calendar.events.list({
            calendarId: calId,
            maxResults: maxResults,
        });
        if (!res.data.items) throw new BaseError("Error fetching events", 400);
        const formattedEvents: GoogleEvent[] = res.data.items?.map((unformattedEvent) =>
            formattToGoogleEvent(unformattedEvent)
        );
        return formattedEvents;
    }

    async addEvent(
        calId: string,
        title: string,
        description: string,
        startDate: string,
        endDate: string
    ): Promise<GoogleEvent> {
        if (!this.client) this.client = await getAuthenticationClient();
        const calendar = google.calendar({ version: "v3", auth: this.client });
        const res = await calendar.events.insert({
            calendarId: calId,
            requestBody: {
                summary: title,
                description: description,
                start: { dateTime: startDate },
                end: { dateTime: endDate },
            },
        });
        const unformattedEvent: calendar_v3.Schema$Event = res.data;
        const formattedEvent: GoogleEvent = formattToGoogleEvent(unformattedEvent);
        return formattedEvent;
    }

    async updateEvent(
        calId: string,
        evId: string,
        title: string,
        description: string,
        startDate: string,
        endDate: string
    ): Promise<GoogleEvent> {
        if (!this.client) this.client = await getAuthenticationClient();
        const calendar = google.calendar({ version: "v3", auth: this.client });
        const res = await calendar.events.update({
            calendarId: calId,
            eventId: evId,
            requestBody: {
                summary: title,
                description: description,
                start: { dateTime: startDate },
                end: { dateTime: endDate },
            },
        });
        const unformattedEvent: calendar_v3.Schema$Event = res.data;
        const formattedEvent: GoogleEvent = formattToGoogleEvent(unformattedEvent);
        return formattedEvent;
    }

    async deleteEvent(calId: string, evId: string): Promise<void> {
        if (!this.client) this.client = await getAuthenticationClient();
        const calendar = google.calendar({ version: "v3", auth: this.client });
        await calendar.events.delete({
            calendarId: calId,
            eventId: evId,
        });
    }
}

export default GoogleCalApi;
