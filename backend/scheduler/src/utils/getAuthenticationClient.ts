import { exec } from "child_process";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import fs from "fs/promises";
import { Credentials, OAuth2Client } from "google-auth-library";
import http from "http";
import os from "os";
import path from "path";
import { URL } from "url";
dotenv.config({ path: path.join(__dirname, "../../../config/.env") });
const CREDENTIALS_PATH = path.join(__dirname, "../../../config/credentials.json");

// Create an oauth client to authorize the API call
const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

function openAuthPage(url: string) {
    const platform = os.platform(); // Detects the platform
    let command = "";

    if (platform === "win32") {
        // For Windows
        command = `start ${url}`;
    } else if (platform === "darwin") {
        // For macOS
        command = `open "${url}"`;
    } else if (platform === "linux") {
        // For Linux
        command = `xdg-open ${url}`;
    } else {
        console.log(`Unsupported platform: ${platform}`);
        return;
    }

    exec(command, (error) => {
        if (error) {
            console.error(`Error opening URL: ${error}`);
        }
    });
}

async function getAuthenticationClient(): Promise<OAuth2Client> {
    try {
        // Create an authentication client from existing credentials
        const res = await fs.readFile(CREDENTIALS_PATH, "utf-8");
        const credentials: Credentials = JSON.parse(res);
        oAuth2Client.setCredentials(credentials);
        return oAuth2Client;
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code != "ENOENT") throw err;
    }
    // Create credentials from scratch
    return new Promise<OAuth2Client>((resolve, reject) => {
        try {
            const authorizedUrl = oAuth2Client.generateAuthUrl({
                access_type: "offline",
                scope: [
                    "https://www.googleapis.com/auth/calendar",
                    "https://www.googleapis.com/auth/calendar.readonly",
                    "https://www.googleapis.com/auth/calendar.events",
                    "https://www.googleapis.com/auth/calendar.events.readonly",
                ],
            });
            const app = express();
            const PORT = 9999;
            const server: http.Server = app
                .get("/vertify", async (req: Request, res: Response) => {
                    const qs = new URL(req.url, `http://localhost:${PORT}`).searchParams;
                    const code = qs.get("code");
                    if (code !== null) {
                        const r = await oAuth2Client.getToken(code);
                        const credentials: Credentials = {
                            access_token: r.tokens.access_token,
                            refresh_token: r.tokens.refresh_token,
                        };
                        await fs.writeFile(
                            CREDENTIALS_PATH,
                            JSON.stringify(credentials, null, 2),
                            "utf-8"
                        );
                        oAuth2Client.setCredentials(credentials);
                    }
                    server.close();
                    res.status(200).send("Authentication successful");
                    resolve(oAuth2Client);
                })
                .listen(PORT, () => {
                    openAuthPage(authorizedUrl);
                });
        } catch (err) {
            reject(err);
        }
    });
}

export default getAuthenticationClient;
