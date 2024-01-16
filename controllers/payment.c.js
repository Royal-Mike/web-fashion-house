const paymentM = require("../models/payment.m");
module.exports = {
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