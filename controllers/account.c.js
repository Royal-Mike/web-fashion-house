const accountM = require("../models/account.m");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const signup = async (req, res, next) => {
  try {
    const un = req.body.username;
    const email = req.body.email;
    const fn = req.body.fullname;
    const dob = req.body.dob;
    const pw = req.body.password;
    const existingUser = await accountM.getAccount(un);
    
    if (existingUser) {
      console.log("user existed");
      return res.redirect('/signup');
    } 

    bcrypt.hash(pw, saltRounds, async function (err, hash) {
      if (err) {
        return next(err);
      }
      const rs = await accountM.createAccount(new accountM(un, email, fn, dob, hash));
      res.redirect("/");
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  signup
};

