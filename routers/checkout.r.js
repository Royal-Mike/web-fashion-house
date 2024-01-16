const express = require("express");
const router = express.Router();
const checkoutC = require("../controllers/checkout.c");

router.use((req, res, next) => {
    if (req.isAuthenticated() || req.session.oauthUser == "gmail") {
        return next();
    }
    res.redirect("/");
});

router.get("/", checkoutC.checkOutPage);

module.exports = router;