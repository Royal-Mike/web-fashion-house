const fs = require('fs/promises');
require('dotenv').config();
const path = require('path');
const filePath1 = path.join(__dirname, '..', 'data', 'data1.json');
const filePath2 = path.join(__dirname, '..', 'data', 'data2.json');
let data1 = '';
let data2 = '';

const allSize = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Freesize"];
const pgp = require('pg-promise')({
    capSQL: true
});

const cn = {
    host: process.env.HOST,
    port: process.env.PORT_DB,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    max: process.env.DB_MAX
};

let db = pgp(cn);
let con = null;

fs.readFile(filePath1, 'utf8')
    .then(fileContent => {
        data1 = JSON.parse(fileContent);
    })
    .catch(error => {
        console.error('Error reading or parsing the file:', error);
    });

fs.readFile(filePath2, 'utf8')
    .then(fileContent => {
        data2 = JSON.parse(fileContent);
    })
    .catch(error => {
        console.error('Error reading or parsing the file:', error);
    });

module.exports = {
    addDataToDB: async () => {
        cn.database = process.env.DB_NAME;

        // const check = await db.any(`SELECT FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
        // if (!check.length) {
        //     await db.none(`CREATE DATABASE $1:name`, [process.env.DB_NAME]);
        //     cn.database = process.env.DB_NAME;
        // } else return;

        db = pgp(cn);
        con = await db.connect();

        await con.none(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            create_date TEXT,
            brand TEXT,
            color TEXT,
            images TEXT[],
            price REAL,
            description TEXT,
            sale TEXT,
            sold INTEGER,
            comments TEXT[],
            stars REAL,
            "for" TEXT,
            relation INTEGER[],
            category TEXT
        )
        `);
        await con.none(`
        CREATE TABLE IF NOT EXISTS size_division (
            id INTEGER,
            size TEXT,
            stock INTEGER,
            PRIMARY KEY (id, size)
        )
        `);
        try {
            const AllProducts1 = data1.products.product;
            for (const product of AllProducts1) {
                const save = {};

                save.name = product.name.__cdata; // text
                save.create_date = product.creation_date.__cdata; // text
                save.brand = product.brand.__cdata; // text
                save.color = product.color.__cdata; // text
                save.images = product.images.image_url instanceof Array ? product.images.image_url : [product.images.image_url]; // text[]
                save.price = product.prices.price[0]; // real
                save.description = product.description.__cdata; // text
                save.id = parseInt(product.name.__cdata.replace(/\D/g, '')); // integer
                save.sale = 'None'; // text
                save.sold = 0; // integer
                save.comments = []; // text[]
                save.stars = 0; // real
                save.category = product.category.__cdata; // text
                save.for = "Nam"; // text
                save.relation = product.other_colors ? product.other_colors.productId : [0]; // integer[]

                for (let i = 0; i < allSize.length; i++) {
                    const size_division = {};
                    size_division.id = save.id;
                    size_division.size = allSize[i]; // text
                    size_division.stock = Math.round(Math.random() * 400 + 40); // integer
                    try {
                        let sql = pgp.helpers.insert(size_division, null, 'size_division');
                        sql += " RETURNING id";
                        await con.one(sql);
                    } catch (error) {
                        console.log(error);
                        throw error;
                    }
                }
                try {
                    let sql = pgp.helpers.insert(save, null, 'products');
                    sql += " RETURNING id";
                    await con.one(sql);
                } catch (error) {
                    console.log(error);
                    throw error;
                }
            }

            const AllProducts2 = data2.products.product;
            for (const product of AllProducts2) {
                const save = {};

                save.name = product.name.__cdata;
                save.create_date = product.creation_date.__cdata;
                save.brand = product.brand.__cdata;
                save.color = product.color.__cdata;
                save.images = product.images.image_url instanceof Array ? product.images.image_url : [product.images.image_url];
                save.price = product.prices.price[0];
                save.description = product.description.__cdata;
                save.id = parseInt(product.name.__cdata.replace(/\D/g, ''));
                save.sale = 'None';
                save.sold = 0;
                save.comments = [];
                save.stars = 0;
                save.category = product.category.__cdata;
                save.for = "Nữ";
                save.relation = product.other_colors ? product.other_colors.productId : [0];

                for (let i = 0; i < allSize.length; i++) {
                    const size_division = {};
                    size_division.id = save.id;
                    size_division.size = allSize[i]; // text
                    size_division.stock = Math.round(Math.random() * 400 + 40); // integer
                    try {
                        let sql = pgp.helpers.insert(size_division, null, 'size_division');
                        sql += " RETURNING id";
                        await con.one(sql);
                    } catch (error) {
                        console.log(error);
                        throw error;
                    }
                }
                try {
                    let sql = pgp.helpers.insert(save, null, 'products');
                    sql += " RETURNING id";
                    await con.one(sql);
                } catch (error) {
                    console.log(error);
                    throw error;
                }
            }
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    signup: async (tbName, obj) => {
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
    },
    get: async (tbName, fieldName, value) => {
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
    },
    email: async (tbName, fieldName, value) => {
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
    },
    getAllEmail:  async (tbName, fieldName, value) => {
        let con = null;
        try {
          con = await db.connect();
          const result = await con.query(
            `SELECT "email" FROM "${tbName}" WHERE "${fieldName}" <> $1;`,
            [value]
          );
          return result.map(row => row.email);
        } catch (error) {
          throw error;
        } finally {
          if (con) con.done();
        }
    },
    update:  async (tbName, fn, email, dob, un) => {
        let con = null;
        try {
          con = await db.connect();
          const result = await con.query(
            `UPDATE "${tbName}" SET "fullname" = $1, "email" = $2, "dob" = $3 WHERE "username" = $4;`,
            [fn, email, dob, un]
          );
          return result;
        } catch (error) {
          throw error;
        } finally {
          if (con) con.done();
        }
    }
}