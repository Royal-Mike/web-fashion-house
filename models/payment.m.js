const db = require("./_db");

module.exports = class Payment {
    constructor(username, totalmoney) {
        this.username = username;
        this.totalmoney = totalmoney;
    }
    static async checkout(data) {
        const rs = await db.checkout("payments", data);
        return rs;
    }
    static async createPaymentAccount(data) {
        // console.log(data);
        const rs = await db.createPaymentAccount("payments", data);
        return rs;
    }
}