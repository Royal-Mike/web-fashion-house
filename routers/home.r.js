const express = require('express');
const router = express.Router();
const homeC = require('../controllers/home.c');

router.get('/home', homeC.homePage);

module.exports = router;