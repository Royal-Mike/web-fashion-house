const db = require("./_db");

module.exports = class Cart {
    constructor(username, product_id, size, price, quantity) {
        this.username = username;
        this.product_id = product_id;
        this.size = size;
        this.price = price;
        this.quantity = quantity;
    }
    static async get(product_id) {
        const rs = await db.get("products", "id", product_id);
        return rs;
    }
    static async addProductToCart(data) {
        const rs = await db.addProductToCart("cart", data);
        return rs;
    }
    static async modifyQuantityInCart(username, product_id, size, quantity) {
        const rs = await db.modifyQuantityInCart("cart", username, product_id, size, quantity);
        return rs;
    }
    static async checkExistProductInCart(username, product_id, size) {
        const rs = await db.checkExistProductInCart("cart", username, product_id, size);
        return rs;
    }
    static async getProductFromCart(fieldName, value) {
        const rs = await db.getProductFromCart("cart", fieldName, value);
        return rs;
    }
}