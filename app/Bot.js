const LocalSession = require("telegraf-session-local");
const {message} = require("telegraf/filters");
const {Chat} = require("./Models/Chat");
const {Product} = require("./Models/Product");
const {Telegraf} = require("telegraf");

class Bot {
    constructor(botToken, chatModel) {
        this.bot = new Telegraf(botToken, {});
        this.chatModel = chatModel;
    }

    setHandlers() {
        const helpHandler = async (ctx) => {
            await ctx.reply('Добавьте бота в ваш канал и отправьте в этот чат команду /register');
        };
        this.bot.start(helpHandler);
        this.bot.help(helpHandler);


        this.bot.command('register', async (ctx) => {
            ctx.session.step = 'enter_chat';

            await ctx.reply('Отправьте айди канала');
        });

        this.bot.command('cancel', async (ctx) => {

            if (!ctx.session.step) {
                return;
            }

            ctx.session.step = null;
            await ctx.reply('Операция отменена');
        })

        this.bot.on('message', async (ctx, next) => {

            if (!ctx.message.text) {
                return next();
            }

            if (!ctx.session.step) {
                await helpHandler(ctx);
                return;
            }

            const step = ctx.session.step;
            if (step === 'enter_chat') {
                const text = ctx.message.text;

                try {
                    const userId = ctx.message.from.id;
                    const chatId = text;
                    const member = await ctx.telegram.getChatMember(chatId, userId);
                    if (member.status !== 'administrator' && member.status !== 'creator') {
                        throw new Error('Вы не являетесь администратором или создателем данного канала');
                    }
                    const chat = await ctx.getChat(chatId);
                    const foundChat = await this.chatModel.find(chat.id);
                    if (foundChat.length > 0) {
                        await ctx.reply('Бот уже зарегестрирован в канале');
                        ctx.session.step = undefined;
                        return;
                    }

                    await this.chatModel.add(chat.id, userId);
                    await ctx.reply('Бот успешно зарегестрирован в канале');
                    ctx.session.step = undefined;
                } catch (errors) {
                    await ctx.reply(errors.message);
                }
            }

        })
    }

    setMiddlewares() {
        this.bot.use((new LocalSession({database: 'session.json'})).middleware());

    }

    async setCommands() {
        await this.bot.telegram.setMyCommands([
            {command: 'help', description: 'Получить помощь'},
            {command: 'register', description: 'Начать диалог регистрации канала'},
            {command: 'cancel', description: 'Отменить диалог'},
        ]);
    }

    async start() {
        await this.setCommands();
        this.setMiddlewares();
        this.setHandlers();
        await this.bot.launch();
        // Enable graceful stop
        process.once('SIGINT', () => this.bot.stop('SIGINT'))
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'))

    }
}

module.exports = {Bot};