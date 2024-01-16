const paymentM = require("../models/payment.m");
const cartM = require("../models/cart.m");
const checkoutM = require("../models/checkout.m");
module.exports = {
    checkout: async (req, res) => {
        try {
            const username = req.body.username;
            const totalmoney = req.body.totalmoney;
            await paymentM.checkout(new paymentM(username, totalmoney));
            const cart = await cartM.getProductFromCart("username", username);
            console.log(cart);
            // res.redirect("http://localhost:3000/home")
            for (const p of cart) {
                await checkoutM.addToOrders(new checkoutM(username, p.product_id, p.quantity, p.price, new Date()));
            }
            res.json({ success: true });
        } catch (error) {
            console.log(error);
        }
    }
}