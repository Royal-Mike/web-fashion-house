const db = require("./_db");

module.exports = class Payment {
    constructor(username, totalmoney) {
        this.username = username;
        this.totalmoney = totalmoney;
    }
    static async checkout(data) {
        const rs = await db.checkout(data);
        return rs;
    }
}