const homeM = require('../models/home.m');

module.exports = {
    home: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;
        // await homeM.addDataToDB();
        res.render('home', {
            title: 'Home',
            home: true,
            dark: dark
        })
    }
};
