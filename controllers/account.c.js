const accountM = require("../models/account.m");
const paymentM = require("../models/payment.m");
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const randomstring = require("randomstring");

const CLIENT_ID =
  "436389758736-p5lst40jnfjn3l9np4a8v2g07ffur99m.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04wbkDa7HYhHkCgYIARAAGAQSNwF-L9IrraPy-_scZ5uRi4DIlB3jqiFjCepDb70WYDiFyw71dxE5qvz3Dpfvwm6zWrRczj_RlYM";

const saltRounds = 10;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

let otp;

async function sendMail() {
  otp = randomstring.generate({
    length: 4,
    charset: "numeric",
  });

  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "nhpqui21@clc.fitus.edu.vn",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOpt = {
      from: "<Fashion House>",
      to: "nguyenhuynhphuqui4856@gmail.com",
      subject: "Quên mật khẩu",
      html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
	  <div style="margin:50px auto;width:70%;padding:20px 0">
		<div style="border-bottom:1px solid #eee">
		  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Fashion House</a>
		</div>
		<p style="font-size:1.1em">Chào bạn,</p>
		<p>Cảm ơn đã chọn Fashion House. Hãy dùng OTP này để thiết lập lại mật khẩu tài khoản của bạn. OTP có hiệu lực trong vòng 5 phút</p>
		<h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
		<p style="font-size:0.9em;">Trân trọng,<br />Fashion House</p>
		<hr style="border:none;border-top:1px solid #eee" />
		<div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
		  <p>Fashion House</p>
		</div>
	  </div>
	</div>`,
    };

    const result = await transport.sendMail(mailOpt);

    return result;
  } catch (error) {
    return error;
  }
}

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

      if (existingUser && existingEmail && existingEmail.email === email) {
        req.flash("unValue", "");
        req.flash("emailValue", "");
        req.flash("fnValue", fn);
        req.flash("dobValue", dob);
        req.flash("pwValue", pw);
        req.flash(
          "errorUser",
          "Tên người dùng đã tồn tại. Vui lòng chọn tên khác!"
        );
        req.flash("errorEmail", "Email đã tồn tại. Vui lòng chọn email khác!");
        return res.redirect("/signup");
      } else if (existingUser) {
        req.flash("emailValue", email);
        req.flash("fnValue", fn);
        req.flash("dobValue", dob);
        req.flash("pwValue", pw);
        req.flash(
          "errorUser",
          "Tên người dùng đã tồn tại. Vui lòng chọn tên khác!"
        );
        return res.redirect("/signup");
      } else if (existingEmail && existingEmail.email === email) {
        req.flash("unValue", un);
        req.flash("fnValue", fn);
        req.flash("dobValue", dob);
        req.flash("pwValue", pw);
        req.flash("errorEmail", "Email đã tồn tại. Vui lòng chọn email khác!");
        return res.redirect("/signup");
      }

      bcrypt.hash(pw, saltRounds, async function (err, hash) {
        if (err) {
          return next(err);
        }
        const rs = await accountM.createAccount(
          new accountM(un, email, fn, dob, hash, role)
        );
        // initialize payment account
        const paymentAccount = await paymentM.createPaymentAccount(
          new paymentM(un, 0)
        );
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
      const role = "user";
      req.session.username = un;

      const existingUser = await accountM.getAccount(un);
      if (existingUser) {
        req.flash(
          "errorUser",
          "Tên người dùng đã tồn tại. Vui lòng chọn tên khác!"
        );
        req.flash("fnValue", fn);
        req.flash("dobValue", dob);
        return res.redirect("/oauthSignup");
      }
      const rs = await accountM.createAccount(
        new accountM(un, email, fn, dob, null, role)
      );
      res.redirect("/home");
    } catch (error) {
      throw error;
    }
  },
  forgetpw: async (req, res, next) => {
    try {
      const email = req.body.email;
      const un = req.body.username;

      const user = await accountM.getAccount(un);

      if (user === null) {
        req.flash(
          "errorUser",
          "Tên người dùng không tồn tại. Vui lòng chọn tên khác!"
        );
        req.flash("emailValue", email);
        return res.redirect("/forget");
      } else if (user.email != email) {
        req.flash("unValue", un);
        req.flash("errorEmail", "Email không khớp với tên tài khoản!");
        return res.redirect("/forget");
      }
      sendMail()
        .then(console.log("Email has sent ..."))
        .catch((error) => console.log(error.message));

      req.session.vertify = un;

      res.redirect("/vertify");
    } catch (error) {
      throw error;
    }
  },
  vertify: (req, res, next) => {
    try {
      const otpInput = req.body.otp;

      if (otp == otpInput) {
        return res.redirect("/resetpw");
      }
      req.flash("error", "OTP không hợp lệ!");
      res.redirect("/vertify");
    } catch (error) {
      throw error;
    }
  },
  resetpw: async (req, res, next) => {
    try {
      const pw = req.body.password;
      const un = req.session.vertify;

      bcrypt.hash(pw, saltRounds, async function (err, hash) {
        if (err) {
          return next(err);
        }
        const rs = await accountM.resetPass(hash, un);
      });

      req.flash("success", "Đặt lại mật khẩu thành công!");
      res.redirect("/");

    } catch (error) {
      throw error;
    }
  },
};
