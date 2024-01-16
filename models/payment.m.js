const db = require("./_db");

module.exports = class Payment {
    constructor(username, totalmoney) {
        this.username = username;
        this.totalmoney = totalmoney;
    }
    static async getBalance(un) {
        const rs = await db.get("payments", "username", un);
        return rs;
    }
    static async addBalance(un, amount) {
        const rs = await db.updateBalance(un, amount);
        return rs;
    }
    static async checkout(data) {
        const rs = await db.checkout("payments", data);
        return rs;
    }
    static async createPaymentAccount(data) {
        const rs = await db.createPaymentAccount("payments", data);
        return rs;
    }
}