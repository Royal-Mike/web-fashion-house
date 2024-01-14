const db = require('./_db');
const table = 'catalogue';

module.exports = class Catalogue {
    constructor(data) {
        this.id_category = data.id_category;
        this.category = data.category;
    }
    static async updateCat(data) {
        const rs = await db.updateCat(data);
        return rs;
    }
    static async addCat(data) {
        const rs = await db.add(table, data);
        return rs;
    }
    static async deleteCat(id) {
        const rs = await db.delete(table, "id_category", id);
        return rs;
    }
}