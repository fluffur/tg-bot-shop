class Chat {
    constructor(db) {
        this.db = db;
        this.createTable();
    }

    async createTable() {
        const sql = `CREATE TABLE IF NOT EXISTS chats (chat_id INT PRIMARY KEY, user_id INT)`;
        await this.db.query(sql);
    }

    async add(chatId, userId) {
        const sql = `INSERT INTO chats (chat_id, user_id) VALUES (?, ?);`;
        await this.db.query(sql, [chatId, userId]);
    }

    async find(chatId) {
        const sql = `SELECT * FROM chats WHERE chat_id = ?`;
        return await this.db.query(sql, [chatId]);
    }

    async findAll() {
        const sql = `SELECT * FROM chats`;
        return await this.db.query(sql);
    }
}

module.exports = {Chat};