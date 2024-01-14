const accountM = require("../models/account.m");
const homeM = require("../models/home.m");
const moment = require("moment");

module.exports = {
    home: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;
        const check = await homeM.checkExistTable();
        if (!check) {
            await homeM.addDataToDB();
        }
        const bestseller = await homeM.getBestseller(1);
        const news = await homeM.getNewarrival(1);
        const recommend = await homeM.getRecommend(1);
        const catalogue = await homeM.getCategory();
        const hot_search = await homeM.getHotSearch();
        res.render('home', {
            title: 'Home',
            home: true,
            dark: dark,
            bestseller: bestseller,
            newarrival: news,
            recommend: recommend,
            catalogue: catalogue,
            hot_search
        })
    },
    getDataWithInput: async (req, res) => {
        const rs = await homeM.getDataWithInput(req.query.input);
        res.json({ data: rs });
    },
    moveToDetailsPage: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;
        const rs = await homeM.moveToDetailsPage(req.query.id);
        const product = rs[0];
        res.render('details', {
            home: true,
            dark: dark,
            name: product.name,
            numComments: product.comments.length,
            sold: product.sold,
            price: product.newPrice,
            color: product.color,
            stars: product.stars,
            image: product.images[0],
            offer: product.sale === 'New arrival' ? 'Sản phẩm mới' : product.sale === 'None' ? 'Chưa có ưu đãi' : product.sale,
            numProducts: product.allstock,
            create: product.create_date,
            brand: product.brand,
            relateProducts: product.relateProducts,
            otherColorProducts: product.otherColorProducts,
            checkOtherColors: product.checkOtherColors,
            cate: product.category,
            check_exists_more: product.relateProducts.length === 24 ? true : false,
            id: req.query.id, // for add to cart
        })
    },
    getDescription: async (req, res) => {
        const rs = await homeM.getDescription(req.query.id);
        res.json({ data: rs[0].description });
    },
    getRelatingPage: async (req, res) => {
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;

        let allRs;
        let type;
        if (req.query.type || req.query.type === "") {
            allRs = await homeM.getRelatingPage(req.query.type, req.query.page);
            type = req.query.type;
            if (req.query.type) {
                await homeM.addHotSearch(req.query.type);
            }
        } else {
            allRs = await homeM.getFilterProducts(req.query.catalogue, req.query.typeProducts, req.query.typePrice, req.query.typeStars, req.query.gender, req.query.page);
            type = req.query.catalogue;
        }

        const rs = allRs[0];
        const length = allRs[1];
        let onePage;
        if (Math.ceil(length / 24) <= 1) {
            onePage = true;
        }
        res.render('relating-page', {
            home: true,
            dark: dark,
            type: type,
            curpage: req.query.page,
            moreRelateProducts: rs,
            onePage: onePage,
            numpage: Math.ceil(length / 24)
        })
    },
    getMoreProductsRecommend: async (req, res) => {
        const data = await homeM.getRecommend(req.query.page);
        res.json({ success: data });
    },
    profile: async (req, res) => {
        const data = await accountM.getAccount(req.session.username);
        const dbDate = data.dob;
        const formattedDate = moment(dbDate).format("YYYY-MM-DD");
        let theme = req.cookies.theme;
        let dark = theme === "dark" ? true : false;
        res.render("account/profile", {
            title: "Profile",
            home: true,
            info: data,
            dob: formattedDate,
            dark: dark,
        });
    },
    updateprofile: async (req, res) => {
        try {
            const { username, fullname, email, dob } = req.body;

            const existingEmail = await accountM.getAllEmailsExceptUsername(username);

            if (existingEmail.includes(req.body.email)) {
                req.flash('errorEmail', 'Email đã tồn tại. Vui lòng chọn email khác!');
                return res.redirect("/home/myProfile");
            } else {
                await accountM.updateMyProfile(username, fullname, email, dob);
                req.flash("success", "Thay đổi thành công!");
                return res.redirect("/home/myProfile");
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    }
};
