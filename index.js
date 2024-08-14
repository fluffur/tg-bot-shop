const {Database} = require("./app/Database");
const {Bot} = require("./app/Bot");
const {Product} = require("./app/Models/Product");
const {Chat} = require("./app/Models/Chat");
const {ProductsNotifier} = require("./app/ProductsNotifier");

require('dotenv').config();


async function run() {

    const db = new Database({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    const chatModel = new Chat(db);
    const productModel = new Product(db);

    await chatModel.createTable();
    await productModel.createTable();

    const bot = new Bot(process.env.BOT_TOKEN, chatModel);
    const job = new ProductsNotifier(bot.bot, chatModel, productModel);

    job.schedule();
    await bot.start();
}

(async () => await run())();