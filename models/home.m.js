const db = require('./db');
module.exports = class Home {
    static async addDataToDB() {
        await db.addDataToDB();
    }
}