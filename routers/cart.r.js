const express = require("express");
const router = express.Router();
const cartC = require("../controllers/cart.c");
router.use((req, res, next) => {
    if (req.isAuthenticated() || req.session.oauthUser == "gmail") {
        return next();
    }
    res.redirect("/");
});

router.get("/addToCart", cartC.addToCart);

module.exports = router;