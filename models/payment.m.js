const db = require("./_db");
const table = "payments";

module.exports = class Payment {
    constructor(username, totalmoney) {
        this.username = username;
        this.totalmoney = totalmoney;
    }
    static async getBalance(un) {
        const rs = await db.get(table, "username", un);
        return rs;
    }
    static async addBalance(un, amount) {
        const rs = await db.updateBalance(table, un, amount);
        return rs;
    }
    static async checkout(data) {
        const rs = await db.checkout(table, data);
        return rs;
    }
    static async createPaymentAccount(data) {
        const rs = await db.createPaymentAccount(table, data);
        return rs;
    }
    static async deletePaymentAccount(un) {
        const rs = await db.deletePaymentAccount(table, un);
        return rs;
    }
}