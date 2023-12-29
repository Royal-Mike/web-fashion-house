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
    },
    getDataWithInput: async (req, res) => {
        const rs = await homeM.getDataWithInput(req.query.input);
        res.json({ data: rs });
    },
    moveToDetailsPage: async (req, res) => {
        const rs = await homeM.moveToDetailsPage(req.query.id);
        const product = rs[0];
        res.render('details', {
            name: product.name,
            numComments: product.comments.length,
            sold: product.sold,
            price: product.newPrice,
            color: product.color,
            image: product.images[0],
            offer: product.sale === 'New arrival' ? 'Sản phẩm mới' : product.sale === 'None' ? 'Chưa có ưu đãi' : product.sale,
            numProducts: product.allstock,
            create: product.create_date,
            brand: product.brand,
            relateProducts: product.relateProducts,
            otherColorProducts: product.otherColorProducts,
            checkOtherColors: product.checkOtherColors,
            cate: product.category
        })
    },
    getDescription: async (req, res) => {
        const rs = await homeM.getDescription(req.query.id);
        res.json({ data: rs[0].description });
    },
    getRelatingPage: async (req, res) => {
        const allRs = await homeM.getRelatingPage(req.query.type, req.query.page);
        const rs = allRs[0];
        res.render('relating-page', {
            type: req.query.type,
            moreRelateProducts: rs
        })
    }
};
