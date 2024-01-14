const db = require('./_db');

module.exports = class Home {
    static async checkExistTable() {
        const rs = await db.checkExistTable();
        return rs;
    }
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
        const rs = await db.getAll("catalogue", "id");
        return rs;
    }
    static async getFilterProducts(catalogue, typeProducts, typePrice, typeStars, gender, page) {
        const rs = await db.getFilterProducts(catalogue, typeProducts, typePrice, typeStars, gender, page);
        return rs;
    }
    static async getHotSearch() {
        const rs = await db.getHotSearch();
        return rs;
    }
    static async addHotSearch(name) {
        await db.addHotSearch(name);
    }
}