import dotenv from "dotenv";
import express from "express";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import path from "path";
import { URL } from "url";
dotenv.config({ path: path.join(__dirname, "../../../config/.env") });
async function getAuthenticationClient() {
    // Create an oauth client to authorize the API call
    const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);
    // Create the url for consent window
    const authorizedUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/calendar.events.readonly",
        ],
    });
    console.log(authorizedUrl);
    const app = express();
    const PORT = 9999;
    const server = app
        .get("/vertify", async (req, res) => {
        const qs = new URL(req.url, `http://localhost:${PORT}`).searchParams;
        const code = qs.get("code");
        console.log(`code is ${code}`);
        if (code !== null) {
            const r = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(r.tokens);
            const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
            const res = await calendar.events.list({
                calendarId: "cb35522d645c22b4db6a8cc893c0234c64af86c6293ef6c135756769f4b50a80@group.calendar.google.com",
                maxResults: 25,
            });
            console.log(res.data.items);
        }
        server.close();
        res.status(200).send("Authentication successful");
    })
        .listen(PORT, async () => {
    });
    return oAuth2Client;
}
(async () => {
    await getAuthenticationClient();
})();
export default getAuthenticationClient;
