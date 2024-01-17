const db = require("./_db");
const table = "orders";

module.exports = class Checkout {
    constructor(username, product_id, quantity, price, order_date) {
        this.username = username;
        this.product_id = product_id;
        this.quantity = quantity;
        this.price = price;
        this.order_date = order_date;
    }
    static async addToOrders(data) {
        const rs = await db.addToOrders(table, data);
        return rs;
    }
    static async getOrders(un) {
        const rs = await db.getMulti(table, "username", un);
        return rs;
    }
}