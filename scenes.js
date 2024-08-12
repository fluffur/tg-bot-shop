import {WizardScene} from "telegraf/scenes";
import {message} from "telegraf/filters";

const getChatRegistrationScene = (db) => {
    return new WizardScene(
        'chat_registration',
        async (ctx) => {
            await ctx.reply('Введите идентификатор канала (если канал приватный, потребуется id, если публичный, то достаточно формат @channelname)')

            return ctx.wizard.next();
        },
        async (ctx) => {

            if (!ctx.message.text) {
                return await ctx.reply('Введите айди чата или /cancel для отмены.')
            }

            if (ctx.message.text === '/cancel') {
                await ctx.reply('Операция успешно отменена');
                return ctx.wizard.next();
            }

            const chat_id = ctx.message.text;

            try {
                const chat = await ctx.telegram.getChat(chat_id);

                if (chat.type !== 'channel') {
                    throw new Error('Идентификатор не указывает на канал');
                }

                const member = await ctx.telegram.getChatMember(chat.id, ctx.message.from.id);
                if (member.status !== 'administrator' && member.status !== 'creator') {
                    throw new Error('Вы не являетесь администратором или создателем данного канала');
                }

                await ctx.reply('Бот успешно привязан к каналу');
                await db.collection('chats').insertOne(chat);

            } catch (error) {
                await ctx.reply(error.message);
                return ctx.wizard.next();

            }

            return ctx.wizard.next();
        }
    );
}


export {getChatRegistrationScene};