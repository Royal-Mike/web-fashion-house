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
            const rs = await paymentM.checkout(new paymentM(username, totalmoney));
            const cart = await cartM.getProductFromCart("username", username);
            for (const p of cart) {
                await checkoutM.addToOrders(new checkoutM(username, p.product_id, p.quantity, p.price, new Date()));
            }
            res.send(rs);
        } catch (error) {
            console.log(error);
        }
    }
}