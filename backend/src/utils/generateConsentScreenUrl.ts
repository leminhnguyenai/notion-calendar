import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });
const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL,
);

const generateConsentScreen = (): string => {
    const authorizedUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/calendar.events.readonly',
            'https://www.googleapis.com/auth/userinfo.email',
        ],
    });
    return authorizedUrl;
};

export default generateConsentScreen;
