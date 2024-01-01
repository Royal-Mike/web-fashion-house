const db = require("./_db");

module.exports = class Cart {
    static async get(product_id) {
        const rs = await db.get("products", "id", product_id);
        return rs;
    }
}