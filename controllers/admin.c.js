const adminM = require('../models/admin.m');
const accountM = require('../models/account.m');

module.exports = {
    home: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;
        const users = await accountM.getAll();
        res.render('admin/home', {
            title: 'Admin',
            dark: dark,
            users: users
        });
    }
};
