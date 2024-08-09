const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const e = require("express");

// Load saved credentials
async function loadSavedCredentialsIfExist(token_path) {
  try {
    const content = await fs.readFile(token_path);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

// Serializes credentials to a file compatible with GoogleAuth.fromJSON.
async function saveCredentials(client, credentials_path, token_path) {
  const content = await fs.readFile(credentials_path);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(token_path, payload);
}

// Create an authorization to use with google APIs
async function authorize(credentials_path, token_path, scopes) {
  let client = await loadSavedCredentialsIfExist(token_path);
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: scopes,
    keyfilePath: credentials_path,
  });
  if (client.credentials) {
    await saveCredentials(client, credentials_path, token_path);
  }
  return client;
}

// Function to create calendar
async function createCalendar(auth, title) {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.calendars.insert({
    requestBody: {
      summary: title,
    },
  });
  return res.data.id;
}

// Function to delete calendar
async function deleteCalendar(auth, calendarId) {
  const calendar = google.calendar({ version: "v3", auth });
  await calendar.calendars.delete({
    calendarId: calendarId,
  });
}

// Function to add event
async function addEvent(auth, calendarId, title, description, startDate, endDate) {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.insert({
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
}

// Function to update event
async function updateEvent(auth, calendarId, eventId, title, description, startDate, endDate) {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.update({
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
}

// Function to delete event
async function deleteEvent(auth, calendarId, eventId) {
  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({
    calendarId: calendarId,
    eventId: eventId,
  });
}

// Function to retrieve events from a specific Google Calendar
async function getEvents(auth, calendarId, maxResults) {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: calendarId,
    maxResults: maxResults,
  });
  return res.data.items;
}
module.exports = {
  authorize,
  createCalendar,
  deleteCalendar,
  addEvent,
  updateEvent,
  deleteEvent,
  getEvents,
};
