const fs = require('fs/promises');
require('dotenv').config();
const path = require('path');
const filePath1 = path.join(__dirname, '..', 'data', 'data1.json');
const filePath2 = path.join(__dirname, '..', 'data', 'data2.json');
let data1 = '';
let data2 = '';

const allSize = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Freesize"];
const offer = ["-10%", "-15%", "-20%", "-25%", "-30%", "-35%", "-40%", "-45%", "-50%", "1 50.000₫", "1 75.000₫", "1 100.000₫", "0 50.000₫", "0 75.000₫", "0 100.000₫", "New arrival", "None"];
const lengthOffer = offer.length;
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
                let holdDescription;
                holdDescription = product.description.__cdata.replace('\n', 'NEWLINECHAR');
                holdDescription = holdDescription.replace('\t', 'TABCHAR');

                save.name = product.name.__cdata; // text
                save.create_date = product.creation_date.__cdata; // text
                save.brand = product.brand.__cdata; // text
                save.color = product.color.__cdata; // text
                save.images = product.images.image_url instanceof Array ? product.images.image_url : [product.images.image_url]; // text[]
                save.price = product.prices.price[0]; // real
                save.description = holdDescription; // text
                save.id = parseInt(product.name.__cdata.replace(/\D/g, '')); // integer
                let index = Math.floor(Math.random() * lengthOffer);
                save.sale = offer[index]; // text
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
                let holdDescription;
                holdDescription = product.description.__cdata.replace('\n', 'NEWLINECHAR');
                holdDescription = holdDescription.replace('\t', 'TABCHAR');

                save.name = product.name.__cdata;
                save.create_date = product.creation_date.__cdata;
                save.brand = product.brand.__cdata;
                save.color = product.color.__cdata;
                save.images = product.images.image_url instanceof Array ? product.images.image_url : [product.images.image_url];
                save.price = product.prices.price[0];
                save.description = holdDescription;
                save.id = parseInt(product.name.__cdata.replace(/\D/g, ''));
                let index = Math.floor(Math.random() * lengthOffer);
                save.sale = offer[index];
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

            await con.none(`
            UPDATE products
            SET sale = uv.sale
            FROM (
                SELECT id, unnest(relation) AS related_id, sale
                FROM products
            ) AS uv
            WHERE products.id = uv.related_id;
            `)
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getBestseller: async (page) => {
        try {
            con = await db.connect();
            let rs = await con.any(`
            SELECT DISTINCT ON (relation) * FROM 
            (SELECT * FROM products WHERE sale LIKE '-%') AS onsale 
            NATURAL JOIN 
            (SELECT id, SUM(stock) AS "totalStock" FROM size_division GROUP BY id);
            `);
            const startIndex = (page - 1) * 10;
            const endIndex = startIndex + 10;
            rs = rs.slice(startIndex, endIndex);
            rs.forEach(product => {
                const sale = parseInt(product.sale.slice(1, 3));
                product.newPrice = (parseFloat(product.price) * (100 - sale) * 23000 / 100.0).toLocaleString();
                product.rate = product.sold * 1.0 / product.totalStock;
                product.thumbnail = product.images[0];
                product.name = product.name.replace(/\d/g, '');
                product.price = (product.price * 23000).toLocaleString();
                product.numComments = product.comments.length;
            });
            return rs;
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getNewarrival: async (page) => {
        try {
            con = await db.connect();
            let rs = await con.any(`
            SELECT DISTINCT ON (relation) * FROM 
            (SELECT * FROM products WHERE sale = 'New arrival') AS arrival 
            NATURAL JOIN 
            (SELECT id, SUM(stock) AS "totalStock" FROM size_division GROUP BY id);
            `);
            const startIndex = (page - 1) * 10;
            const endIndex = startIndex + 10;
            rs = rs.slice(startIndex, endIndex);
            rs.forEach(product => {
                product.rate = product.sold * 1.0 / product.totalStock;
                product.thumbnail = product.images[0];
                product.name = product.name.replace(/\d/g, '');
                product.price = (product.price * 23000).toLocaleString();
                product.numComments = product.comments.length;
            });
            return rs;
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getRecommend: async (page) => {
        try {
            con = await db.connect();
            let rs0 = await con.any(`
            SELECT DISTINCT ON (relation) * FROM 
            (SELECT * FROM products WHERE sale LIKE '1%') AS recommend 
            NATURAL JOIN 
            (SELECT id, SUM(stock) AS "totalStock" FROM size_division GROUP BY id);
            `);
            let rs1 = await con.any(`
            SELECT * FROM 
            (SELECT * FROM products WHERE sale LIKE '0%') AS recommend 
            NATURAL JOIN 
            (SELECT id, SUM(stock) AS "totalStock" FROM size_division GROUP BY id);
            `);
            const startIndex = (page - 1) * 10;
            const endIndex = startIndex + 10;
            rs0 = rs0.slice(startIndex, endIndex);
            rs1 = rs1.slice(startIndex, endIndex);
            let rs = rs0.concat(rs1);
            rs.forEach(product => {
                product.rate = product.sold * 1.0 / product.totalStock;
                product.thumbnail = product.images[0];
                product.name = product.name.replace(/\d/g, '');
                if (product.sale.startsWith('1')) {
                    product.check = true;
                    let temp = product.sale.replace('.', '')
                    temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                    product.newPrice = ((product.price * 23000) - temp).toLocaleString();

                } else {
                    product.check = false;
                    let temp = product.sale.replace('.', '');
                    temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                    product.newPrice = ((product.price * 23000) - temp).toLocaleString();
                };
                product.sale = product.sale.slice(2);
                product.sale = product.sale.replace('.', ',');
                product.price = (product.price * 23000).toLocaleString();
                product.numComments = product.comments.length;
            });
            return rs;
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getDataWithInput: async (input) => {
        try {
            con = await db.connect();
            let rs = await con.any(`SELECT DISTINCT ON (relation) * FROM products WHERE name ILIKE '%${input}%' AND (sale LIKE '1%' OR sale LIKE '-%') LIMIT 15`);
            rs.forEach(product => {
                product.name = product.name.replace(/\d/g, '');
                product.thumbnail = product.images[0];
                if (product.sale.startsWith('1')) {
                    let temp = product.sale.replace('.', '')
                    temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                    product.newPrice = ((product.price * 23000) - temp).toLocaleString();
                    product.sale = product.sale.slice(2);

                } else if (product.sale.startsWith('0')) {
                    let temp = product.sale.replace('.', '');
                    temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                    product.newPrice = ((product.price * 23000) - temp).toLocaleString();
                    product.sale = product.sale.slice(2);
                } else {
                    const sale = parseInt(product.sale.slice(1, 3));
                    product.newPrice = (parseFloat(product.price) * (100 - sale) * 23000 / 100.0).toLocaleString();
                }
                product.sale = product.sale.replace('.', ',');
            });
            return rs;
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getDetailsProduct: async (id) => {
        try {
            con = await db.connect();
            let rs = await con.any(`
            SELECT
                p."id",
                p."name",
                p.create_date,
                p.brand,
                p.color,
                p.images,
                p.price,
                p.description,
                p.sale,
                p.sold,
                p."comments",
                p.stars,
                p."for",
                p.relation,
                p.category,
                SUM(sd.stock) AS allStock
            FROM
                products AS p
                NATURAL JOIN size_division AS sd
            WHERE
                p.id = ${id}
            GROUP BY
                p."id";
            `);

            let relateProducts = await con.any(`
            SELECT DISTINCT ON (relation) * FROM 
            (
                SELECT category FROM products WHERE id = ${id}
            ) AS cate
            NATURAL JOIN products
            WHERE id <> ${id} AND id <> ALL(ARRAY[${rs[0].relation}])
            LIMIT 24;`);

            let otherColorProducts = await con.any(`
                SELECT * FROM products WHERE id = ANY(ARRAY[${rs[0].relation}]) AND "for" = '${rs[0].for}' AND id <> ${id}`);
            rs.forEach(product => {
                product.name = product.name.replace(/\d/g, '');
                if (product.sale.startsWith('1')) {
                    let temp = product.sale.replace('.', '')
                    temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                    product.newPrice = ((product.price * 23000) - temp).toLocaleString();
                    product.sale = 'Giảm ' + product.sale.slice(2);

                } else if (product.sale.startsWith('0')) {
                    let temp = product.sale.replace('.', '');
                    temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                    product.newPrice = ((product.price * 23000) - temp).toLocaleString();
                    product.sale = 'Tăng ' + product.sale.slice(2);
                } else if (product.sale.startsWith('-')) {
                    const sale = parseInt(product.sale.slice(1, 3));
                    product.newPrice = (parseFloat(product.price) * (100 - sale) * 23000 / 100.0).toLocaleString();
                } else {
                    product.newPrice = (product.price * 23000).toLocaleString();
                }
                product.color = product.color[0].toUpperCase() + product.color.slice(1);

                relateProducts.forEach(relatePro => {
                    relatePro.name = relatePro.name.replace(/\d/g, '');
                    relatePro.thumbnail = relatePro.images[0];
                    if (relatePro.sale.startsWith('1')) {
                        let temp = relatePro.sale.replace('.', '')
                        temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                        relatePro.newPrice = ((relatePro.price * 23000) - temp).toLocaleString();
                        relatePro.sale = 'Giảm ' + relatePro.sale.slice(2);

                    } else if (relatePro.sale.startsWith('0')) {
                        let temp = relatePro.sale.replace('.', '');
                        temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                        relatePro.newPrice = ((relatePro.price * 23000) - temp).toLocaleString();
                        relatePro.sale = 'Tăng ' + relatePro.sale.slice(2);
                    } else if (relatePro.sale.startsWith('-')) {
                        const sale = parseInt(relatePro.sale.slice(1, 3));
                        relatePro.newPrice = (parseFloat(relatePro.price) * (100 - sale) * 23000 / 100.0).toLocaleString();
                    } else {
                        relatePro.newPrice = (relatePro.price * 23000).toLocaleString();
                    }
                    relatePro.color = relatePro.color[0].toUpperCase() + relatePro.color.slice(1);
                    relatePro.sale = relatePro.sale === 'New arrival' ? 'Sản phẩm mới' : relatePro.sale === 'None' ? 'Chưa có ưu đãi' : relatePro.sale;
                    relatePro.sale = relatePro.sale.replace('.', ',');
                });
                product.relateProducts = relateProducts;

                if (otherColorProducts.length > 0) {
                    otherColorProducts.forEach(colorPro => {
                        colorPro.name = colorPro.name.replace(/\d/g, '');
                        colorPro.color = colorPro.color[0].toUpperCase() + colorPro.color.slice(1);
                        colorPro.thumbnail = colorPro.images[0];
                    });
                    product.otherColorProducts = otherColorProducts;
                    product.checkOtherColors = true;
                }
                else product.checkOtherColors = false;
            });
            return rs;
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getRelatingPage: async (type, page) => {
        try {
            con = await db.connect();
            let rs = await con.any(`SELECT DISTINCT ON (relation) * FROM products WHERE category ILIKE '%${type}%' OR name ILIKE '%${type}%'`);
            const length = rs.length;
            const startIndex = (page - 1) * 24;
            const endIndex = startIndex + 24;
            rs = rs.slice(startIndex, endIndex);
            rs.forEach(product => {
                product.name = product.name.replace(/\d/g, '');
                if (product.sale.startsWith('1')) {
                    let temp = product.sale.replace('.', '')
                    temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                    product.newPrice = ((product.price * 23000) - temp).toLocaleString();
                    product.sale = 'Giảm ' + product.sale.slice(2);

                } else if (product.sale.startsWith('0')) {
                    let temp = product.sale.replace('.', '');
                    temp = parseInt(temp.replace(/^\d+\s*/, '').replace(/₫/, ''), 10)
                    product.newPrice = ((product.price * 23000) - temp).toLocaleString();
                    product.sale = 'Tăng ' + product.sale.slice(2);
                } else if (product.sale.startsWith('-')) {
                    const sale = parseInt(product.sale.slice(1, 3));
                    product.newPrice = (parseFloat(product.price) * (100 - sale) * 23000 / 100.0).toLocaleString();
                } else {
                    product.newPrice = (product.price * 23000).toLocaleString();
                }
                product.color = product.color[0].toUpperCase() + product.color.slice(1);
                product.thumbnail = product.images[0];
                product.numComments = product.comments.length;
                product.sale = product.sale === 'New arrival' ? 'Sản phẩm mới' : product.sale === 'None' ? 'Chưa có ưu đãi' : product.sale;
                product.sale = product.sale.replace('.', ',');
            });
            return [rs, length];
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getDescription: async (id) => {
        try {
            con = await db.connect();
            const rs = await con.any(`SELECT description FROM products WHERE id = ${id}`);
            rs.forEach(product => {
                let tempDesc = product.description.replace('NEWLINECHAR', '\n');
                tempDesc = tempDesc.replace('TABCHAR', '\t');
                product.description = tempDesc;
            });
            return rs;
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
    getAll: async (tbName, order) => {
        let con = null;
        try {
            con = await db.connect();
            const rs = await con.any(`SELECT * FROM "${tbName}" ORDER BY ${order}`);
            return rs;
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
    delete: async (tbName, fieldName, value) => {
        let con = null;
        try {
            con = await db.connect();
            const rs = await con.none(
                `DELETE FROM "${tbName}" WHERE "${fieldName}" = $1`,
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
    updateUser: async (data) => {
        let con = null;
        try {
            con = await db.connect();
            const condition = pgp.as.format(' WHERE username = ${usernameOld}', data);
            let sql = pgp.helpers.update(data, ['username', 'fullname', 'email', 'dob', 'role'], 'accounts') + condition;
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
    checkout: async (tbName, paymentJson) => {
        let con = null;
        try {
            console.log(paymentJson);
            con = await db.connect();
            // const username = paymentJson.username;
            // const totalMoney = paymentJson.totalMoney;
            // await con.none(`INSERT INTO ${tbName} ("username", "totalmoney") VALUES ($1, $2);`, [username, totalMoney]);
            let sql = pgp.helpers.insert(paymentJson, null, tbName);
            console.log(sql);
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
}