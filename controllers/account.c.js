const accountM = require("../models/account.m");
const paymentM = require("../models/payment.m");
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
			const role = "user";

			const existingUser = await accountM.getAccount(un);
			const existingEmail = await accountM.getEmail(email);

			if (existingUser && (existingEmail && existingEmail.email === email)) {
				req.flash("unValue", "");
				req.flash("emailValue", "");
				req.flash('fnValue', fn);
				req.flash('dobValue', dob);
				req.flash('pwValue', pw);
				req.flash('errorUser', 'Tên người dùng đã tồn tại. Vui lòng chọn tên khác!');
				req.flash('errorEmail', 'Email đã tồn tại. Vui lòng chọn email khác!');
				return res.redirect('/signup');
			}
			else if (existingUser) {
				req.flash('emailValue', email);
				req.flash('fnValue', fn);
				req.flash('dobValue', dob);
				req.flash('pwValue', pw);
				req.flash('errorUser', 'Tên người dùng đã tồn tại. Vui lòng chọn tên khác!');
				return res.redirect('/signup');
			} else if (existingEmail && existingEmail.email === email) {
				req.flash('unValue', un);
				req.flash('fnValue', fn);
				req.flash('dobValue', dob);
				req.flash('pwValue', pw);
				req.flash('errorEmail', 'Email đã tồn tại. Vui lòng chọn email khác!');
				return res.redirect('/signup');
			}

			bcrypt.hash(pw, saltRounds, async function (err, hash) {
				if (err) {
					return next(err);
				}
				const rs = await accountM.createAccount(new accountM(un, email, fn, dob, hash, role));
				// initialize payment account
				const paymentAccount = await paymentM.createPaymentAccount(new paymentM(un, 0));
				req.flash("success", "Tạo tài khoản thành công!");
				res.redirect("/");
			});
		} catch (error) {
			throw error;
		}
	},
	oauthSignup: async (req, res, next) => {
		try {
			const email = req.session.email;
			const un = req.body.username;
			const fn = req.body.fullname;
			const dob = req.body.dob;
			const role = 'user';
			req.session.username = un;

			const existingUser = await accountM.getAccount(un);
			if (existingUser) {
				req.flash("errorUser", "Tên người dùng đã tồn tại. Vui lòng chọn tên khác!");
				req.flash('fnValue', fn);
				req.flash('dobValue', dob);
				return res.redirect('/oauthSignup');
			} 
			const rs = await accountM.createAccount(new accountM(un, email, fn, dob, null, role));
			res.redirect("/home");

		} catch (error) {
			throw error;
		}
	},
};

