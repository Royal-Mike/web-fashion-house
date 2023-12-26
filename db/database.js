const pgp = require("pg-promise")({
    capSQL: true,
});

const cn = {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "123456",
    database: "WEB-FASHION-HOUSE",
    max: 30,
};

const db = pgp(cn);

module.exports = db;