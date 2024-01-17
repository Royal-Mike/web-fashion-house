const express = require("express");
const router = express.Router();
const checkoutC = require("../controllers/checkout.c");


const checkAuthentication = (req, res, next) => {
    if (req.isAuthenticated() || req.session.oauthUser == "gmail") {
        return next();
    }
    res.redirect("/");
}

router.get("/", checkoutC.checkOutPage);
router.post("/paymentServer", checkAuthentication, checkoutC.sendCheckOutRequestToPaymentServer);

module.exports = router;