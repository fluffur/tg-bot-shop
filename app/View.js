const ejs = require('ejs');

class View {
    constructor(baseDir) {
        this.baseDir = process.cwd() + baseDir.trimEnd('/');
    }

    async render(view, params = {}) {
        return await ejs.renderFile(this.baseDir + '/' + view.trimEnd('.ejs') + '.ejs', params);
    }

    async reply(ctx, view, params = {}) {
        await ctx.reply(await this.render(view, params));
    }
}

module.exports = {View};