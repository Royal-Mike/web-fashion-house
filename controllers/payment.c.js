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
            const username = req.query.username;
            const totalmoney = req.query.totalmoney;
            const cart = await cartM.getProductFromCart("username", username);

            let product_id_arr = [];
            let quantity_arr = [];
            for (const p of cart) {
                product_id_arr.push(p.product_id);
                quantity_arr.push(p.quantity);
            }

            const rs = await paymentM.checkout(new paymentM(username, totalmoney));
            if (rs === "success") {
                await checkoutM.addToOrders(new checkoutM(username, product_id_arr, quantity_arr, totalmoney, new Date()));
            }
            res.send(rs);
        } catch (error) {
            console.log(error);
        }
    }
}