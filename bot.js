import {apiUrl, bot, db} from "./bootstrap.js";
import axios from "axios";
import {CronJob} from "cron";
import {Stage} from "telegraf/scenes";
import {getChatRegistrationScene} from "./scenes.js";

const stage = new Stage([getChatRegistrationScene(db)]);

bot.use(stage.middleware());

bot.command('register', async ctx => {
    await ctx.scene.enter('chat_registration');
})

bot.start(async ctx => {
    await ctx.reply('Добро пожаловать, данный бот занимается рассылкой товаров.' +
        '\n\nДобавьте его в канал для подписки на уведомления и зарегестрируйте через /register.');

});


bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


const sendNewProduct = async () => {
    console.log('Send new product');
    const productsCollection = db.collection('products');

    const sentProducts = await productsCollection.find().toArray();
    const sentProductIds = sentProducts.map(product => product.id);
    const allProducts = (await axios.get(apiUrl + '/products')).data;
    const newProducts = allProducts.filter(product => !sentProductIds.includes(product.id));

    const product = newProducts.length > 0 ? newProducts[0] : null;

    if (product === null) {
        return;
    }

    await productsCollection.insertOne(product);

    const chatsCollection = db.collection('chats');
    const chats = await chatsCollection.find().toArray()
    for (const chat of chats) {
        const chat_id = chat.id;

        const category = product.category
            .replaceAll(/['\s]/g, '')
            .toLowerCase();

        const message = `
Новый продукт: ${product.title}
Цена: $${product.price}
Рейтинг: ${product.rating.rate} ⭐️
Количество в наличии: ${product.rating.count} шт.

Описание: <blockquote>${product.description}</blockquote>

#${category}
`.trim();
        await bot.telegram.sendPhoto(chat_id, product.image, {caption: message, parse_mode: "HTML"})
    }
}

CronJob.from({
    onTick: sendNewProduct,
    cronTime: '*/1 * * * *',
    start: true
});