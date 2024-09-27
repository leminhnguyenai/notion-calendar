const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const axios = require("axios");
const { CREDENTIALS_PATH, TOKEN_PATH } = require("../../Paths");
const BOUNDARY = "batch_google_calendar";

// Load client secrets from a local file
fs.readFile(CREDENTIALS_PATH, "utf-8", (err, content) => {
  if (err) return console.error("Error loading client secret file:", err);

  authorize(JSON.parse(content), sendBatchRequest); // Call function once authorized
});

// Create OAuth2 client and authorize it with token.json
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } =
    credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0],
  );

  // Load the access and refresh tokens from token.json
  fs.readFile(TOKEN_PATH, "utf-8", (err, token) => {
    if (err) return console.error("Error loading token file:", err);

    oAuth2Client.setCredentials(JSON.parse(token));

    // Ensure token is refreshed if needed
    oAuth2Client.getAccessToken((err, token) => {
      if (err) {
        console.error("Error refreshing access token:", err);
      } else {
        // Execute the callback function after token refresh
        console.log(oAuth2Client.credentials);
      }
    });
  });
}

// Function to send a batch request to insert two events
async function sendBatchRequest(auth) {
  // Prepare the events to insert
  const event1 = {
    summary: "Meeting with Bob",
    start: {
      dateTime: "2024-09-26T09:00:00-07:00",
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: "2024-09-26T10:00:00-07:00",
      timeZone: "America/Los_Angeles",
    },
  };

  const event2 = {
    summary: "Lunch with Alice",
    start: {
      dateTime: "2024-09-26T12:00:00-07:00",
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: "2024-09-26T13:00:00-07:00",
      timeZone: "America/Los_Angeles",
    },
  };

  // Helper function to create POST requests for the batch
  const insertEventRequest = (calendarId, event, uniqueId) => {
    return `--${BOUNDARY}
Content-Type: application/http
Content-ID: <${uniqueId}>

POST /calendar/v3/calendars/${calendarId}/events HTTP/1.1
Host: www.googleapis.com
Content-Type: application/json

${JSON.stringify(event)}
`;
  };

  // Generate unique Content-ID using timestamp or UUID
  const uniqueId1 = `item-${Date.now()}-1`;
  const uniqueId2 = `item-${Date.now()}-2`;

  // Combine the two requests into a single batch request
  const batchRequestBody = [
    insertEventRequest("primary", event1, uniqueId1), // First event
    insertEventRequest("primary", event2, uniqueId2), // Second event
    `--${BOUNDARY}--`, // End of batch request
  ].join("\n");
  // Send the batch request using Axios
  try {
    const response = await axios.post(
      "https://www.googleapis.com/batch/calendar/v3",
      batchRequestBody,
      {
        headers: {
          Authorization: `Bearer ${auth.credentials.access_token}`, // Ensure valid token
          "Content-Type": `multipart/mixed; boundary=${BOUNDARY}`,
        },
      },
    );

    // Log the response (each event's creation status will be returned)
  } catch (error) {
    console.error(
      "Error sending batch request:",
      error.response ? error.response.data : error.message,
    );
  }
}
