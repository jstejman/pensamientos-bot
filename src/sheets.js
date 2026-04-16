import { GoogleAuth } from 'google-auth-library';
import { config } from 'dotenv';

config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getAuthClient() {
  const auth = new GoogleAuth({
    scopes: SCOPES,
    credentials: {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
    },
  });
  return auth;
}

export async function appendToSheet({ autor, timestamp, contenido }) {
  const auth = await getAuthClient();
  const sheets = await import('googleapis').then(m => m.google.sheets({ version: 'v4', auth }));

  const row = [autor, timestamp, contenido];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'A1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [row],
    },
  });

  console.log(`[SHEETS] Fila agregada: autor=${autor}, timestamp=${timestamp}`);
}

export async function initSheet() {
  const auth = await getAuthClient();
  const sheets = await import('googleapis').then(m => m.google.sheets({ version: 'v4', auth }));

  try {
    await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });
    console.log('[SHEETS] Sheet encontrado');
  } catch (error) {
    if (error.code === 404) {
      console.log('[SHEETS] Sheet no existe, creando...');
      const spreadsheet = await sheets.spreadsheets.create({
        resource: {
          properties: {
            title: 'Pensamientos',
          },
          sheets: [{
            properties: {
              title: 'Datos',
                gridProperties: {
                columnCount: 3,
              },
            },
          }],
        },
      });
      console.log(`[SHEETS] Sheet creado: ${spreadsheet.data.spreadsheetId}`);
    } else {
      throw error;
    }
  }
}
