const db = require('./_db');

module.exports = class Admin {
    static async getAllCatalogues() {
        const rs = await db.getAll("catalogue", "id");
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