import pino from 'pino';
import { startBot } from './bot.js';
import { config } from 'dotenv';

config();

console.log('=== PENSIENTOS BOT ===');
console.log('Iniciando...');

startBot().catch(console.error);
