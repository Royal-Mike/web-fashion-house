const accountM = require("../models/account.m");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = {
	signup: async (req, res, next) => {
		try {
			const un = req.body.username;
			const email = req.body.email;
			const fn = req.body.fullname;
			const dob = req.body.dob;
			const pw = req.body.password;
	
			const existingUser = await accountM.getAccount(un);
			const existingEmail = await accountM.GetEmail(email);
	
			if (existingUser) {
				req.flash("error", "Username already exists!");
				return res.redirect('/signup');
			} else if (existingEmail && existingEmail.email === email) {
				req.flash('errorEmail', 'Email đã tồn tại. Vui lòng chọn email khác!');
				return res.redirect('/signup');
			}
	
			bcrypt.hash(pw, saltRounds, async function (err, hash) {
				if (err) {
					return next(err);
				}
				const rs = await accountM.createAccount(new accountM(un, email, fn, dob, hash));
				req.flash("success", "Tạo tài khoản thành công!");
				res.redirect("/");
			});
		} catch (error) {
			throw error;
		}
	}
};

