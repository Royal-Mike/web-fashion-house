const pgp = require("pg-promise")({
    capSQL: true,
});

const cn = {
    host: process.env.HOST,
    port: process.env.PORT_DB,
    user: process.env.USER,
    password: process.env.PW,
    database: process.env.DB_NAME,
    max: process.env.MAX,
};

const db = pgp(cn);

module.exports = db;