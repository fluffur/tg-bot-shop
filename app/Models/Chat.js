class Chat {
    constructor(db) {
        this.db = db;
    }

    async createTable() {
        const sql = 'CREATE TABLE IF NOT EXISTS chats (id INT PRIMARY KEY AUTO_INCREMENT, chat_id VARCHAR(300) UNIQUE, user_id VARCHAR(300) UNIQUE )';
        await this.db.query(sql);
    }

    async add(chatId, userId) {
        const sql = 'INSERT INTO chats (chat_id, user_id) VALUES (?, ?);';
        await this.db.query(sql, [chatId, userId]);
    }

    async find(chatId) {
        const sql = 'SELECT * FROM chats WHERE chat_id = ?';
        return await this.db.query(sql, [chatId]);

    }

    async findAll() {
        const sql = 'SELECT * FROM chats';
        return await this.db.query(sql);
    }
}

module.exports = {Chat};