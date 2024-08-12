import { Telegraf, session } from 'telegraf';
import { MongoClient } from 'mongodb';
import {config} from "dotenv";

config();

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use(session())

// Подключение к базе данных
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.MONGODB_DATABASE);
const apiUrl = process.env.FAKE_STORE_API_URI;

export {bot, db, apiUrl}