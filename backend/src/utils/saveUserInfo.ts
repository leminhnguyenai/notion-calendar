import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import mysql, { Connection, ConnectionOptions } from "mysql2/promise";
import { BaseError } from "../Errors";

const saveUserInfo = async (code: string): Promise<void> => {
    const oAuth2Client = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URL
    );
    const connectionOption: ConnectionOptions = {
        host: "localhost",
        user: "root",
        password: process.env.DATABASE_PASSWORD,
        port: Number(process.env.DATABASE_PORT),
        database: process.env.DATABASE_NAME,
        waitForConnections: true,
        queueLimit: 10,
    };

    const r = await oAuth2Client.getToken(code);

    const { access_token, refresh_token } = r.tokens;
    if (!refresh_token || !access_token)
        throw new BaseError("", "Error getting refresh token", 400);

    oAuth2Client.setCredentials({ refresh_token: refresh_token });
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    if (!email) throw new BaseError("", "Error retrieving user's email", 400);
    const conn: Connection = await mysql.createConnection(connectionOption);
    await conn.query(
        `INSERT INTO users(email, refresh_token) VALUES('${email}', '${refresh_token}') ON DUPLICATE KEY UPDATE refresh_token = '${refresh_token}'`
    );
    await conn.end();
};

export default saveUserInfo;
