const express = require("express");
const router = express.Router();
const cartC = require("../controllers/cart.c");
router.use((req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
});

router.get("/addToCart", cartC.addToCart);
router.get("/", cartC.cartPage);
router.get("/increaseQuantity", cartC.increaseQuantity);

module.exports = router;