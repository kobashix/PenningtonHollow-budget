import { google } from 'googleapis';

// Note: This logic will eventually run in a backend server (e.g., Next.js API route or separate Express app)
// since service account credentials must NOT be exposed to the client-side React app.

export const getSheetsClient = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};
