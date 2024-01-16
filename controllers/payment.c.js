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
            // console.log(cart);
            // res.redirect("http://localhost:3000/home")
            let product_id_arr = [];
            let quantity_arr = [];
            let overall = 0;
            for (const p of cart) {
                product_id_arr.push(p.product_id);
                quantity_arr.push(p.quantity);
                // console.log("total price: ", p.total_price);
                overall += p.price * p.quantity;
            }

            await checkoutM.addToOrders(new checkoutM(username, product_id_arr, quantity_arr, overall, new Date()));
            res.json({ success: true });
        } catch (error) {
            console.log(error);
        }
    }
}