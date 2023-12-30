const paymentM = require("../models/payment.m");
module.exports = {
    checkout: async (req, res) => {
        // console.log(req.body);
        const payment = new paymentM(req.username, req.totalmoney);
        console.log(payment);
        const rs = await paymentM.checkout(payment);
        res.redirect("/home"); // or redirect back to checkout page
    }
}