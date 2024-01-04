const db = require('./_db');

module.exports = class Home {
    static async addDataToDB() {
        await db.addDataToDB();
    }
    static async getBestseller(page) {
        const rs = await db.getBestseller(page);
        return rs;
    }
    static async getNewarrival(page) {
        const rs = await db.getNewarrival(page);
        return rs;
    }
    static async getRecommend(page) {
        const rs = await db.getRecommend(page);
        return rs;
    }
    static async getDataWithInput(input) {
        const rs = await db.getDataWithInput(input);
        return rs;
    }
    static async moveToDetailsPage(id) {
        const rs = await db.getDetailsProduct(id);
        return rs;
    }
    static async getDescription(id) {
        const rs = await db.getDescription(id);
        return rs;
    }
    static async getRelatingPage(type, page) {
        const rs = await db.getRelatingPage(type, page);
        return rs;
    }
    static async getCategory() {
        const rs = await db.getCategory();
        return rs;
    }
}