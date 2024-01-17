const paymentM = require("../models/payment.m");
const cartM = require("../models/cart.m");
const checkoutM = require("../models/checkout.m");
module.exports = {
    balance: async (req, res) => {
        try {
            const rs = await paymentM.getBalance(req.body.username);
            res.send(rs);
        } catch (error) {
            console.log(error);
        }
    },
    addBalance: async (req, res) => {
        try {
            const rs = await paymentM.addBalance(req.body.username, req.body.amount);
            res.send(rs);
        } catch (error) {
            console.log(error);
        }
    },
    checkout: async (req, res) => {
        try {
            const username = req.body.username;
            const totalmoney = req.body.totalmoney;
            const cart = await cartM.getProductFromCart("username", username);

            let product_id_arr = [];
            let quantity_arr = [];
            let overall = 0;
            for (const p of cart) {
                product_id_arr.push(p.product_id);
                quantity_arr.push(p.quantity);
                overall += p.price * p.quantity;
            }

            const rs = await paymentM.checkout(new paymentM(username, totalmoney));
            if (rs === "success") {
                await checkoutM.addToOrders(new checkoutM(username, product_id_arr, quantity_arr, overall, new Date()));
            }
            res.send(rs);
        } catch (error) {
            console.log(error);
        }
    }
}