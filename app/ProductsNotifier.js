const {CronJob} = require("cron");
const axios = require("axios");
const { setDefaultResultOrder } = require("node:dns");
const {View} = require("./View");

class ProductsNotifier {
    constructor(bot, chatModel, productModel, apiUrl = 'https://fakestoreapi.com') {
        this.bot = bot;
        this.chatModel = chatModel;
        this.productModel = productModel;
        this.apiUrl = apiUrl;
        this.view = new View('/app/Views');
    }

    async sendNewProduct() {

        console.debug('Send new product');

        setDefaultResultOrder("ipv4first");

        const sentProducts = await this.productModel.findAll();

        const sentProductIds = sentProducts.map(product => product.id);
        const allProducts = (await axios.get(this.apiUrl + '/products')).data;
        const newProducts = allProducts.filter(product => !sentProductIds.includes(product.id));

        const product = newProducts.length > 0 ? newProducts[0] : null;

        if (product === null) {
            return;
        }

        await this.productModel.add(product.id);

        const chats = await this.chatModel.findAll();
        for (const chat of chats) {
            const chat_id = +chat.chat_id;
            product.category = product.category.replaceAll(/['\s]/g, '').toLowerCase();

            const message = await this.view.render('notifier/product', {product: product})


            await this.bot.telegram.sendPhoto(chat_id, product.image, {caption: message, parse_mode: "HTML"})
        }
    }

    schedule() {

        CronJob.from({
            onTick: async () => await this.sendNewProduct(),
            cronTime: '*/1 * * * *',
            start: true
        });
    }
}

module.exports = {ProductsNotifier};


