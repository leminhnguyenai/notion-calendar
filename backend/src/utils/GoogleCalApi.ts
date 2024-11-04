import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import { calendar_v3, google } from "googleapis";
import path from "path";
import { BaseError } from "../Errors";
dotenv.config({ path: path.join(__dirname, "../../.env") });

class GoogleCalApi {
    private auth: OAuth2Client;
    private calendar: calendar_v3.Calendar;
    constructor(refresh_token: string) {
        this.auth = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URL
        );
        this.auth.setCredentials({ refresh_token: refresh_token });
        this.calendar = google.calendar({ version: "v3", auth: this.auth });
    }

    async createCalendar(title: string): Promise<string> {
        const res = await this.calendar.calendars.insert({
            requestBody: { summary: title },
        });
        if (!res.data.id) throw new BaseError("", "Error retrieving calendar id", 400);
        return res.data.id;
    }

    async updateCalendar(calId: string, newTitle: string): Promise<void> {
        await this.calendar.calendars.update({
            calendarId: calId,
            requestBody: {
                summary: newTitle,
            },
        });
    }

    async deleteCalendar(calId: string): Promise<void> {
        await this.calendar.calendars.delete({
            calendarId: calId,
        });
    }
}

export default GoogleCalApi;
