const homeM = require('../models/home.m');

module.exports = {
    home: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;
        // await homeM.addDataToDB();
        const bestseller = await homeM.getBestseller(1);
        const news = await homeM.getNewarrival(1);
        const recommend = await homeM.getRecommend(1);
        res.render('home', {
            title: 'Home',
            home: true,
            dark: dark,
            bestseller: bestseller,
            newarrival: news,
            recommend: recommend
        })
    }
};
