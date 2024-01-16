const express = require("express");
const router = express.Router();
const paymentC = require("../controllers/payment.c");


router.post("/checkout", paymentC.checkout);

module.exports = router;