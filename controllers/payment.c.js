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
            await paymentM.checkout(new paymentM(username, totalmoney));
            // res.redirect("http://localhost:3000/home")
            res.json({ success: true });
        } catch (error) {
            console.log(error);
        }
    }
}