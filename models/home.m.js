const db = require('./_db');

module.exports = class Home {
    static async addDataToDB() {
        await db.addDataToDB();
    }
}