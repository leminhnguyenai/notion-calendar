import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import mysql, { Pool } from "mysql2/promise";
import { BaseError } from "../Errors";
import { poolOption } from "../config/db";
import MessageQueue from "../services/messageQueue";

const saveUserInfo = async (code: string, msgQueue: MessageQueue): Promise<void> => {
    const oAuth2Client = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URL
    );

    const r = await oAuth2Client.getToken(code);

    const { access_token, refresh_token } = r.tokens;
    if (!refresh_token || !access_token)
        throw new BaseError("", "Error getting refresh token", 400);

    oAuth2Client.setCredentials({ refresh_token: refresh_token });
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    if (!email) throw new BaseError("", "Error retrieving user's email", 400);
    const pool: Pool = mysql.createPool(poolOption(2));
    const user_id: string = await bcrypt.hash(`${refresh_token}_${email}_${new Date()}`, 10);
    await msgQueue.enqueue(
        pool.query(
            `INSERT INTO users 
                    VALUES(
                        '${user_id}',
                        '${email}', 
                        '${refresh_token}',
                        'user'
                    ) 
                 ON DUPLICATE KEY UPDATE refresh_token = '${refresh_token}'`
        ),
        "db"
    );
    await msgQueue.enqueue(
        pool.query(`
                     INSERT INTO settings(user_id)
                    VALUES(
                        '${user_id}'
                    ) 
    `),
        "db"
    );
    await pool.end();
    new Date().toISOString();
};

export default saveUserInfo;
