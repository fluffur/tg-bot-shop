const mysql = require("mysql2/promise");

class Database {
    constructor(config) {
        this.config = config;
        this.connection = null;
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection(this.config);
        } catch (error) {
            console.error('Failed to connect to the database:', error.message);
            throw error;
        }
    }

    async query(sql, params = []) {
        try {
            if (!this.connection) {
                await this.connect();
            }
            const [results,] = await this.connection.execute(sql, params);
            return results;
        } catch (error) {
            console.error('Database query failed:', error.message);
            throw error;
        }
    }

    async close() {
        try {
            if (this.connection) {
                await this.connection.end();
                console.log('Database connection closed.');
            }
        } catch (error) {
            console.error('Failed to close the database connection:', error.message);
            throw error;
        }
    }
}

module.exports = {Database}