const LocalSession = require("telegraf-session-local");
const {Telegraf} = require("telegraf");
const {View} = require("./View");


class Bot {
    constructor(botToken, chatModel) {
        this.bot = new Telegraf(botToken, {});
        this.chatModel = chatModel;
        this.view = new View('/app/Views');
    }


    setHandlers() {
        const helpHandler = async (ctx) => {
            await this.view.reply(ctx, 'help');
        };
        this.bot.start(helpHandler);
        this.bot.help(helpHandler);


        this.bot.command('register', async (ctx) => {
            ctx.session.step = 'enter_chat';

            await this.view.reply(ctx, 'commands/register');
        });

        this.bot.command('cancel', async (ctx) => {

            if (!ctx.session.step) {
                return;
            }

            ctx.session.step = null;
            await this.view.reply(ctx, 'commands/cancel');
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
                const userId = ctx.message.from.id;

                try {
                    const chatId = text;
                    const member = await ctx.telegram.getChatMember(chatId, userId);

                    console.log(chatId);

                    if (member.status !== 'administrator' && member.status !== 'creator') {
                        await this.view.reply(ctx, 'errors/forbidden');
                        return;
                    }

                    const chat = await ctx.telegram.getChat(chatId);
                    const foundChat = await this.chatModel.find(chat.id);

                    if (foundChat.length > 0) {
                        await this.view.reply(ctx, 'chat/already_registered');
                        ctx.session.step = null;
                        return;
                    }

                    await this.chatModel.add(chat.id.toString(), userId.toString());
                    await this.view.reply(ctx, 'chat/success');
                    ctx.session.step = null;
                } catch (errors) {
                    await this.view.reply(ctx, 'errors/chat', {message: errors.message});
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