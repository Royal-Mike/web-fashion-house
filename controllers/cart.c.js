const cartM = require("../models/cart.m");

module.exports = {
    addToCart: async (req, res) => {
        const product_id = req.query.id;
        console.log(product_id);
        if (!req.session.cart) {
            req.session.cart = [];
        }
        const isExistProductIndex = req.session.cart.findIndex(item => item.id === parseInt(product_id));
        if (isExistProductIndex !== -1) {
            req.session.cart[isExistProductIndex].quantity += 1;
        } else {
            const product = await cartM.get(product_id);
            product.quantity = 1;
            req.session.cart.push(product);
        }
        res.redirect(`http://localhost:3000/details?id=${product_id}`);
    }
}