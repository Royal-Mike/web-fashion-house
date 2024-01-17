const cartM = require("../models/cart.m");

module.exports = {
    checkOutPage: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;

        const cart = req.session.cart;
        const shipCost = 0;

        for (const product of cart) {
            if (product.sale.startsWith('1')) {
                let temp = product.sale.replace('.', '')
                temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                product.newPrice = (product.price * 23000) - temp;
            } else if (product.sale.startsWith('0')) {
                let temp = product.sale.replace('.', '');
                temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                product.newPrice = (product.price * 23000) + temp;
            } else if (product.sale.startsWith('-')) {
                const sale = parseInt(product.sale.slice(1, 3));
                product.newPrice = parseFloat(product.price) * (100 - sale) * 23000 / 100.0;
            } else {
                product.newPrice = product.price * 23000;
            }
            product.total_price = product.newPrice * parseInt(product.quantity);
            product.newPrice = product.newPrice.toLocaleString();
        }

        let checkout_price = 0;
        for (let i = 0; i < cart.length; i++) {
            checkout_price += cart[i].total_price;
            cart[i].total_price = cart[i].total_price.toLocaleString();
        };
        
        const overall = (checkout_price + shipCost).toLocaleString();
        checkout_price = checkout_price.toLocaleString();

        res.render("payment/checkout", {
            cart: cart,
            username: req.session.username,
            checkout_price: checkout_price,
            shipCost: shipCost,
            overall: overall,
            totalQuantity: cart.length,
            dark: dark,
            title: 'Checkout'
        });
    }
}