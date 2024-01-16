const express = require("express");
const router = express.Router();
const paymentC = require("../controllers/payment.c");

router.post("/balance", paymentC.balance);
router.post("/addbal", paymentC.addBalance);
router.post("/checkout", paymentC.checkout);

module.exports = router;