const db = require('./_db');

module.exports = class Admin {
    static async getAllProducts() {
        const rs = await db.getAll("products", "id");
        return rs;
    }
}