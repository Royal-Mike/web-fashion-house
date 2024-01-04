const db = require('./_db');

module.exports = class Admin {
    static async getProductsAdd() {
        const rs = await db.getStatsProductsAdd();
        return rs;
    }
    static async getRevenueYear() {
        const rs = await db.getStatsRevenueYear();
        return rs;
    }
    static async getBestSeller() {
        const rs = await db.getStatsBestSeller();
        return rs;
    }
}