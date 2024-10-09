const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const fs = require("fs").promises;
const axios = require("axios");
const { CREDENTIALS_PATH, TOKEN_PATH, CAL_SCOPES } = require("../../Paths.js");

class GoogleCalendarAPI {
  constructor() {
    this.credentials_path = CREDENTIALS_PATH;
    this.token_path = TOKEN_PATH;
    this.scopes = CAL_SCOPES;
    this.clientPromise = this._initialize();
  }

  // intialize the authentication
  async _initialize() {
    const client = await this._authorize();
    this.calendar = google.calendar({ version: "v3", auth: client });
    // Get the access token to send batch request
    const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, "utf-8"));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const token = JSON.parse(await fs.readFile(TOKEN_PATH, "utf-8"));
    oAuth2Client.setCredentials(token);
    this.auth = await oAuth2Client.getAccessToken();
  }

  // get the client for authentication
  async _authorize() {
    const savedClient = await this._loadSavedCredentialsIfExist();
    if (savedClient) {
      return savedClient;
    }

    const client = await authenticate({
      scopes: this.scopes,
      keyfilePath: this.credentials_path,
    });

    if (client.credentials) {
      await this._saveCredentials(client);
      return client;
    }
  }

  async _loadSavedCredentialsIfExist() {
    const content = await fs.readFile(this.token_path);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  }

  async _saveCredentials(client) {
    const content = await fs.readFile(this.credentials_path);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: "authorized_user",
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(this.token_path, payload);
  }

  async createCalendar(title) {
    await this.clientPromise; // Ensure client is initialized
    const res = await this.calendar.calendars.insert({
      requestBody: { summary: title },
    });
    return res.data.id;
  }

  async updateCalendar(calendarId, title) {
    await this.clientPromise;
    await this.calendar.calendars.update({
      calendarId: calendarId,
      requestBody: { summary: title },
    });
  }

  async deleteCalendar(calendarId) {
    await this.clientPromise;
    await this.calendar.calendars.delete({
      calendarId: calendarId,
    });
  }

  async addEvent(calendarId, { title, description, startDate, endDate }) {
    await this.clientPromise;
    const res = await this.calendar.events.insert({
      calendarId: calendarId,
      requestBody: {
        summary: title,
        description: description,
        start: { dateTime: startDate },
        end: { dateTime: endDate },
      },
    });
    return res.data;
  }

  async updateEvent(calendarId, eventId, { title, description, startDate, endDate }) {
    await this.clientPromise;
    const res = await this.calendar.events.update({
      calendarId: calendarId,
      eventId: eventId,
      requestBody: {
        summary: title,
        description: description,
        start: { dateTime: startDate },
        end: { dateTime: endDate },
      },
    });
    return res.data;
  }

  async deleteEvent(calendarId, eventId) {
    await this.clientPromise;
    await this.calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId,
    });
  }

  async getEvents(calendarId, maxResults = 250) {
    await this.clientPromise;
    const res = await this.calendar.events.list({
      calendarId: calendarId,
      maxResults: maxResults,
    });
    return res.data.items;
  }

  async sendBatchRequest(calendarId, requests) {
    if (requests.length == 0) return;
    await this.clientPromise;
    const BOUNDARY = "batch_google_calendar";
    const formattedRequests = requests.map((request) => {
      return `--${BOUNDARY}
Content-Type: application/http
Content-ID: <${request.page_id}>

${request.method} /calendar/v3/calendars/${calendarId}/events HTTP/1.1
Host: www.googleapis.com
Content-Type: application/json

${JSON.stringify(request.body)}
    `;
    });
    formattedRequests.push(`--${BOUNDARY}--`);
    const batchRequestBody = formattedRequests.join("\n");

    const response = await axios.post(
      "https://www.googleapis.com/batch/calendar/v3",
      batchRequestBody,
      {
        headers: {
          Authorization: `Bearer ${this.auth.token}`,
          "Content-Type": `multipart/mixed; boundary=${BOUNDARY}`,
        },
      }
    );
    return response.data;
  }
}

module.exports = { GoogleCalendarAPI };
