const accountM = require("../models/account.m");
const moment = require("moment");

module.exports = {
  home: async (req, res) => {
    let theme = req.cookies.theme;
    let dark = theme === "dark" ? true : false;
    res.render("home", {
      title: "Home",
      home: true,
      dark: dark,
    });
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
    }else {
        await accountM.updateMyProfile(username, fullname, email, dob);
        req.flash("success", "Thay đổi thành công!");
        return res.redirect("/home/myProfile");
    }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};
