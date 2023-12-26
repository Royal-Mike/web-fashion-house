// const userM = require("../model/user.m");

const home = async (req, res) => {
    let theme = req.cookies.theme;
    let dark = theme === "dark" ? true : false;
    res.render('home', {
        title: 'Home',
        home: true,
        dark: dark
    })
};

module.exports = {
  home,
};
