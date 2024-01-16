const paymentM = require("../models/payment.m");
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
            res.send(rs);
        } catch (error) {
            console.log(error);
        }
    }
}