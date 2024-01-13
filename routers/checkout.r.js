const express = require("express");
const router = express.Router();
const checkoutC = require("../controllers/checkout.c");

router.get("/", checkoutC.checkOutPage);

module.exports = router;