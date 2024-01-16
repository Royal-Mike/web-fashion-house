const cartM = require("../models/cart.m");

module.exports = {
    checkOutPage: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;

        const cart = req.session.cart;
        const shipCost = 20;

        // console.log(cart);

        for (const product of cart) {
            if (product.sale.startsWith('1')) {
                let temp = product.sale.replace('.', '')
                temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                product.newPrice = ((product.price * 23000) - temp).toLocaleString();
            } else if (product.sale.startsWith('0')) {
                let temp = product.sale.replace('.', '');
                temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                product.newPrice = ((product.price * 23000) - temp).toLocaleString();
            } else if (product.sale.startsWith('-')) {
                const sale = parseInt(product.sale.slice(1, 3));
                product.newPrice = (parseFloat(product.price) * (100 - sale) * 23000 / 100.0).toLocaleString();
            } else {
                product.newPrice = (product.price * 23000).toLocaleString();
            }
            product.total_price = parseFloat(product.newPrice) * parseInt(product.quantity);
        }
        let checkout_price = 0;
        for (let i = 0; i < cart.length; i++) {
            checkout_price += cart[i].total_price;
        };
        checkout_price = parseFloat(checkout_price).toFixed(2);
        const overall = parseFloat(checkout_price) + shipCost;


        res.render("payment/checkout", {
            cart: cart,
            username: req.session.username,
            checkout_price: checkout_price,
            shipCost: shipCost,
            overall: overall,
            totalQuantity: cart.length,
            dark: dark
        });
    }
}