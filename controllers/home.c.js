const homeM = require('../models/home.m');
module.exports = {
    homePage: async (req, res, next) => {
        try {
            await homeM.addDataToDB();
            res.render('home', {

            })
        } catch (error) {
            next(error);
        }
    }
}