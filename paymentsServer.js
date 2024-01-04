require("dotenv").config();
const express = require('express')
const https = require("https");
const fs = require("fs");
const app = express()
const port = process.env.PAYMENT_PORT || 3113;
const opts = {
    key: fs.readFileSync("./_cert/key.pem", { encoding: "utf-8" }),
    cert: fs.readFileSync("./_cert/cert.pem", { encoding: "utf-8" })
}
const paymentsServer = https.createServer(opts, app);

app.get('/', (req, res) => res.send('Hello World!'));
paymentsServer.listen(port, () => console.log(`Example app listening on port ${port}!`));