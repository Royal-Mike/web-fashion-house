require("dotenv").config();
const express = require('express')
const https = require("https");
const fs = require("fs");
const app = express()
const cors = require("cors");
const port = process.env.PAYMENT_PORT || 3113;
const opts = {
    requestCert: true,
    rejectUnauthorized: false,
    key: fs.readFileSync("./_cert/key.pem", { encoding: "utf-8" }),
    cert: fs.readFileSync("./_cert/cert.pem", { encoding: "utf-8" })
}
const paymentsServer = https.createServer(opts, app);
const paymentR = require("./routers/payment.r");

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/payment", paymentR);

app.get('/', (req, res) => res.send('Hello World!'));
paymentsServer.listen(port, () => console.log(`Payment app listening on port ${port}!`));