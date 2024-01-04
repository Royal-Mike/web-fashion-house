const db = require('./_db');

module.exports = class Admin {
    static async getBestSeller() {
        const rs = await db.getStatsBestSeller();
        return rs;
    }
    static async getProductsAdd() {
        const rs = await db.getStatsProductsAdd();
        return rs;
    }
}