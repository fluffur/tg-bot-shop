class Product {
    constructor(db) {
        this.db = db;
    }

    async createTable() {
        const sql = 'CREATE TABLE IF NOT EXISTS products (id INT PRIMARY KEY AUTO_INCREMENT, product_id INT UNIQUE)';
        await this.db.query(sql);
    }

    async add(productId) {
        const sql = 'INSERT INTO products (product_id) VALUES (?);';
        await this.db.query(sql, [productId]);
    }

    async find(productId) {
        const sql = 'SELECT * FROM products WHERE product_id = ?';
        return await this.db.query(sql, [productId]);
    }

    async findAll() {
        return await this.db.query('SELECT * FROM products');
    }
}

module.exports = {Product};