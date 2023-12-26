const pgp = require("pg-promise")({
    capSQL: true,
});

const db = require("../db/database");

const signup = async (tbName, obj) => {
    let con = null;
    try {
      con = await db.connect();
      let sql = pgp.helpers.insert(obj, null, tbName);
      await con.none(sql);
      return 1;
    } catch (error) {
      throw error;
    } finally {
      if (con) {
        con.done();
      }
    }
};

const get = async (tbName, fieldName, value) => {
    let con = null;
    try {
      con = await db.connect();
      const rs = await con.oneOrNone(
        `SELECT * FROM "${tbName}" WHERE "${fieldName}" = $1`,
        [value]
      );
      return rs;
    } catch (error) {
      throw error;
    } finally {
      if (con) {
        con.done();
      }
    }
  };

module.exports = class Account {
    constructor(un, email, fn, dob, pw) {
      this.username = un;
      this.email = email;
      this.fullname = fn;
      this.dob = dob;
      this.password = pw;
    }
    static async createAccount(data) {
      const rs = await signup("accountDb", data);
      return rs;
    }
    static async getAccount(un) {
        const rs = await get("accountDb", "username", un);
        return rs;
      }
};