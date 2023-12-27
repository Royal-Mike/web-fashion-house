// const userM = require("../model/user.m");
const homeM = require('../models/home.m');

const home = async (req, res) => {
    let theme = req.cookies.theme;
    let dark = theme === "dark" ? true : false;
    // await homeM.addDataToDB();
    res.render('home', {
        title: 'Home',
        home: true,
        dark: dark
    })
};

module.exports = {
  home,
};
