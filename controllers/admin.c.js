const adminM = require('../models/admin.m');

module.exports = {
    home: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;
        res.render('admin/home', {
            title: 'Admin',
            dark: dark
        });
    }
};
