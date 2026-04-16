import { Baileys, MultiFileAuthState } from '@whiskeysockets/baileys';
import { appendToSheet } from './sheets.js';

const PENSAMIENTO_REGEX = /pensamiento\s*(?:(\d{1,2}:\d{2})\s*)?(.+)/i;

function getMessageText(msg) {
  if (!msg) return '';
  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage) return msg.extendedTextMessage.text;
  return '';
}

export async function startBot() {
  const { state, saveState } = await MultiFileAuthState('./auth_info_baileys');

  const sock = Baileys({
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.fromMe) continue;

      const text = getMessageText(msg.message);
      if (!text) continue;

      const match = text.match(PENSAMIENTO_REGEX);
      if (!match) continue;

      const [, hora, contenido] = match;
      const senderNum = msg.key.participant || msg.key.remoteJid;
      const autor = msg.pushName || senderNum;
      const timestamp = new Date().toISOString();

      console.log(`[PENSAMIENTO]${hora ? ` ${hora}` : ''} ${contenido} (de: ${autor})`);

      try {
        await appendToSheet({ autor, timestamp, contenido });
      } catch (error) {
        console.error('[ERROR] Guardando en sheets:', error.message);
      }
    }
  });

  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
      console.log('[WHATSAPP] Conectado y listo');
    } else if (connection === 'close') {
      console.log('[WHATSAPP] Conexion cerrada, reintentando...');
    }
  });

  return sock;
}
