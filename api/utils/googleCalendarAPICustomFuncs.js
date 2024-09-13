const fs = require("fs").promises;
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

class GoogleCalendarAPI {
  constructor({ credentials_path, token_path, scopes }) {
    this.credentials_path = credentials_path;
    this.token_path = token_path;
    this.scopes = scopes;
    this.clientPromise = this._initialize();
  }

  // intialize the authentication
  async _initialize() {
    const client = await this._authorize();
    this.calendar = google.calendar({ version: "v3", auth: client });
  }

  // get the client for authentication
  async _authorize() {
    try {
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
    } catch (err) {
      console.error(err);
      throw new err();
    }
  }

  async _loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(this.token_path);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      console.error(err);
      throw new err();
    }
  }

  async _saveCredentials(client) {
    try {
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
    } catch (err) {
      console.error(err);
      throw new err();
    }
  }

  async createCalendar(title) {
    try {
      await this.clientPromise; // Ensure client is initialized
      const res = await this.calendar.calendars.insert({
        requestBody: {
          summary: title,
        },
      });
      return res.data.id;
    } catch (err) {
      console.error(err);
      throw new err();
    }
  }

  async updateCalendar(calendarId, title) {
    try {
      await this.clientPromise;
      await this.calendar.calendars.update({
        calendarId: calendarId,
        requestBody: {
          summary: title,
        },
      });
    } catch (err) {
      console.error(err);
      throw new err();
    }
  }

  async deleteCalendar(calendarId) {
    try {
      await this.clientPromise;
      await this.calendar.calendars.delete({
        calendarId: calendarId,
      });
    } catch (err) {
      console.error(err);
      throw new err();
    }
  }

  async addEvent(calendarId, title, description, startDate, endDate) {
    try {
      await this.clientPromise;
      const res = await this.calendar.events.insert({
        calendarId: calendarId,
        requestBody: {
          summary: title,
          description: description,
          start: {
            dateTime: startDate,
          },
          end: {
            dateTime: endDate,
          },
        },
      });
      return res.data;
    } catch (err) {
      console.error(err);
      throw new err();
    }
  }

  async updateEvent(calendarId, eventId, title, description, startDate, endDate) {
    try {
      await this.clientPromise;
      const res = await this.calendar.events.update({
        calendarId: calendarId,
        eventId: eventId,
        requestBody: {
          summary: title,
          description: description,
          start: {
            dateTime: startDate,
          },
          end: {
            dateTime: endDate,
          },
        },
      });
      return res.data;
    } catch (err) {
      console.error(err);
      throw new err();
    }
  }

  async deleteEvent(calendarId, eventId) {
    try {
      await this.clientPromise;
      await this.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
      });
    } catch (err) {
      console.error(err);
      throw new err();
    }
  }

  async getEvents(calendarId, maxResults) {
    await this.clientPromise;
    const res = await this.calendar.events.list({
      calendarId: calendarId,
      maxResults: maxResults,
    });
    return res.data.items;
  }
}

module.exports = { GoogleCalendarAPI };
