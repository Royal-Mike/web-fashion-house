const db = require('./_db');

module.exports = class Admin {
    static async getAllCategories() {
        const rs = await db.getAll("categories", "id");
        return rs;
    }
    static async getAllProducts() {
        const rs = await db.getAll("products", "id");
        return rs;
    }
    static async getAllUsers() {
        const rs = await db.getAll("accounts", "role");
        return rs;
    }
}