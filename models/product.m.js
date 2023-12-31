const db = require('./_db');
const table = 'products';

module.exports = class Product {
    constructor(data) {
        this.name = data.name;
        this.create_date = data.create_date;
        this.brand = data.brand;
        this.color = data.color;
        this.images = data.images;
        this.price = data.price;
        this.description = data.description;
        this.sale = data.sale;
        this.for = data.for;
        this.category = data.category;
    }
    static async updatePro(data) {
        const rs = await db.updatePro(data);
        return rs;
    }
    static async addPro(data) {
        const rs = await db.add(table, data);
        return rs;
    }
    static async deletePro(id) {
        const rs = await db.delete(table, "id", id);
        return rs;
    }
}