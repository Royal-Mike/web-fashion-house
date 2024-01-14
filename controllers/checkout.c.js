
module.exports = {
    checkOutPage: (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;

        const cart = req.session.cart;
        const shipCost = 20;
        // console.log(cart);
        let checkout_price = 0;
        for (let i = 0; i < cart.length; i++) {
            checkout_price += cart[i].total_price;
        }

        res.render("payment/checkout", {
            cart: cart,
            checkout_price: checkout_price,
            shipCost: shipCost,
            overall: checkout_price * shipCost,
            totalQuantity: cart.length,
            dark: dark
        });
    }
}