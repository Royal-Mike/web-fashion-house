const db = require("./_db");
const table = "accounts";

module.exports = class Account {
	constructor(un, email, fn, dob, pw, role) {
		this.username = un;
		this.email = email;
		this.fullname = fn;
		this.dob = dob;
		this.password = pw;
		this.role = role;
	}
	static async createAccount(data) {
		const rs = await db.signup(table, data);
		return rs;
	}
	static async getAccount(un) {
		const rs = await db.get(table, "username", un);
		return rs;
	}
	static async GetEmail(un) {
		const rs = await db.email(table, "email", un);
		return rs;
	}
	static async getAll() {
		const rs = await db.getAll(table);
		return rs;
	}
};
