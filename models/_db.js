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

let colorBestSeller = [];
let colorNewArrival = [];
let colorRecommend = [];

module.exports = {
    checkExistDB: async () => {
        const check = await db.any(`SELECT FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
        if (!check.length) {
            return false;
        } else return true;
    },
    createDB: async () => {
        await db.none(`CREATE DATABASE $1:name`, [process.env.DB_NAME]);
        cn.database = process.env.DB_NAME;

        db = pgp(cn);
        con = await db.connect();
        await con.none(`
        CREATE TABLE IF NOT EXISTS public.accounts
        (
            username character varying(100) COLLATE pg_catalog."default" NOT NULL,
            email text COLLATE pg_catalog."default",
            fullname text COLLATE pg_catalog."default",
            dob date,
            password character varying(100) COLLATE pg_catalog."default",
            role text COLLATE pg_catalog."default",
            CONSTRAINT "accountDb_pkey" PRIMARY KEY (username)
        )

        TABLESPACE pg_default;

        ALTER TABLE IF EXISTS public.accounts
            OWNER to postgres;
        `);

        await con.none(`
        CREATE TABLE IF NOT EXISTS payments (
            payment_id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            totalMoney REAL NOT NULL,
            FOREIGN KEY (username) REFERENCES accounts(username)
        );`);

        await con.none(`
        CREATE TABLE IF NOT EXISTS cart (
            id SERIAL PRIMARY KEY,
            username TEXT,
            product_id INTEGER,
            size TEXT,
            price REAL,
            quantity INTEGER
        );
        `);

        await con.none(`
        CREATE TABLE IF NOT EXISTS comments (
            username TEXT,
            comment TEXT,
            stars INTEGER,
            id INTEGER,
            time TIMESTAMP,
            PRIMARY KEY (username, time)
        )
        `)

        if (con) {
            con.done();
        }
    },
    checkExistTable: async () => {
        cn.database = process.env.DB_NAME;
        db = pgp(cn);
        con = await db.connect();
        const check = await db.any(`
        SELECT COUNT(*)
        FROM 
        (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'products'
        )
        `);
        if (con) {
            con.done();
        }
        for (const temp of check) {
            return temp.count > 0;
        }
    },
    addDataToDB: async () => {
        cn.database = process.env.DB_NAME;

        db = pgp(cn);
        con = await db.connect();
        await con.none(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            create_date TIMESTAMP,
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
            id_category TEXT
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

        await con.none(`
        CREATE TABLE IF NOT EXISTS hot_search (
            name TEXT, 
            numsearch INTEGER DEFAULT 0
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
                save.sold = Math.floor(Math.random() * 999); // integer
                save.comments = []; // text[]
                save.stars = 0; // real
                save.id_category = product.category.__cdata; // text
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
                save.sold = Math.floor(Math.random() * 999);
                save.comments = [];
                save.stars = 0;
                save.id_category = product.category.__cdata;
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

            await con.none(`
            CREATE TABLE IF NOT EXISTS catalogue (
                id_category SERIAL PRIMARY KEY,
                category TEXT
            )
            `)

            await con.none(`
            DELETE FROM products WHERE images = ARRAY[NULL];
            `)

            let getCatalogue = await con.any(`SELECT distinct(id_category) FROM products`);
            for (const catalogue of getCatalogue) {
                await con.none(`INSERT INTO catalogue(category) VALUES($1)`, [catalogue.id_category])
            }

            await con.none(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                username TEXT,
                product_id INT[], 
                quantity INT[],
                price REAL,
                order_date DATE
            )
            `)

            await con.none(`
            UPDATE products
            SET id_category = up.id_category
            FROM catalogue AS up
            WHERE products.id_category = up.category
            `)

            await con.none(`
            UPDATE products
            SET id_category = CAST(id_category AS INTEGER)
            `)
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    addHotSearch: async (name) => {
        try {
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            const getData = await con.any(`SELECT * FROM hot_search WHERE name = '${name}'`);
            if (getData.length > 0) {
                for (const temp of getData) {
                    await con.none(`UPDATE hot_search SET numsearch = ${temp.numsearch + 1} WHERE name = '${name}'`);
                    break;
                }
            } else {
                await con.none(`INSERT INTO hot_search VALUES ('${name}', 1)`);
            }
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getHotSearch: async () => {
        try {
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            const rs = await con.any(`SELECT * FROM hot_search ORDER BY numsearch LIMIT 8`);
            return rs;
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
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            let rs = await con.any(`
            SELECT * FROM 
            (
                SELECT DISTINCT ON (relation) * FROM 
                (SELECT * FROM products) AS allsold
                NATURAL JOIN 
                (SELECT id, SUM(stock) AS "totalStock" FROM size_division GROUP BY id)
                ORDER BY relation, sold DESC
            ) AS newtable 
            ORDER BY sold DESC;
            `);
            const startIndex = (page - 1) * 10;
            const endIndex = startIndex + 10;
            rs = rs.slice(startIndex, endIndex);

            colorBestSeller = [];

            for (const product of rs) {
                let tempColor = await con.any(`
                SELECT * FROM products WHERE (id = ANY(ARRAY[${product.relation}]) OR id = ${product.id}) AND "for" = '${product.for}'`);
                let tempColorArray = [];

                for (const color of tempColor) {
                    if (!tempColorArray.includes(color.color)) {
                        tempColorArray.push(color.color);
                    }
                }
                colorBestSeller.push(tempColorArray);
            }

            rs.forEach((product, index) => {
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
                product.sale = product.sale === 'New arrival' ? 'Sản phẩm mới' : product.sale === 'None' ? 'Chưa có ưu đãi' : product.sale;
                product.rate = product.sold * 100.0 / product.totalStock;
                product.thumbnail = product.images[0];
                product.name = product.name.replace(/\d/g, '');
                product.price = (product.price * 23000).toLocaleString();
                product.numComments = product.comments.length;
                product.holdColors = colorBestSeller[index];
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
    getNewarrival: async (page) => {
        try {
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
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

            colorNewArrival = [];

            for (const product of rs) {
                let tempColor = await con.any(`
                SELECT * FROM products WHERE (id = ANY(ARRAY[${product.relation}]) OR id = ${product.id}) AND "for" = '${product.for}'`);
                let tempColorArray = [];

                for (const color of tempColor) {
                    if (!tempColorArray.includes(color.color)) {
                        tempColorArray.push(color.color);
                    }
                }

                colorNewArrival.push(tempColorArray);
            }

            rs.forEach((product, index) => {
                product.rate = product.sold * 100.0 / product.totalStock;
                product.thumbnail = product.images[0];
                product.name = product.name.replace(/\d/g, '');
                product.price = (product.price * 23000).toLocaleString();
                product.numComments = product.comments.length;
                product.holdColors = colorNewArrival[index];
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
    getRecommend: async (page) => {
        try {
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            let rs0 = await con.any(`
            SELECT DISTINCT ON (relation) * FROM 
            (SELECT * FROM products WHERE sale LIKE '1%') AS recommend 
            NATURAL JOIN 
            (SELECT id, SUM(stock) AS "totalStock" FROM size_division GROUP BY id);
            `);
            let rs1 = await con.any(`
            SELECT DISTINCT ON (relation) * FROM 
            (SELECT * FROM products WHERE sale LIKE '0%') AS recommend 
            NATURAL JOIN 
            (SELECT id, SUM(stock) AS "totalStock" FROM size_division GROUP BY id);
            `);
            const startIndex = (page - 1) * 10;
            const endIndex = startIndex + 10;
            rs0 = rs0.slice(startIndex, endIndex);
            rs1 = rs1.slice(startIndex, endIndex);
            let rs = rs0.concat(rs1);

            colorRecommend = [];

            for (const product of rs) {
                let tempColor = await con.any(`
                SELECT * FROM products WHERE (id = ANY(ARRAY[${product.relation}]) OR id = ${product.id}) AND "for" = '${product.for}'`);
                let tempColorArray = [];

                for (const color of tempColor) {
                    if (!tempColorArray.includes(color.color)) {
                        tempColorArray.push(color.color);
                    }
                }

                colorRecommend.push(tempColorArray);
            }

            rs.forEach((product, index) => {
                product.rate = product.sold * 100.0 / product.totalStock;
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
                product.holdColors = colorRecommend[index];
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
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            let rs = await con.any(`SELECT DISTINCT ON (relation) * FROM 
            (
                SELECT * FROM products
                LEFT JOIN catalogue AS cata ON products.id_category::INTEGER = cata.id_category
            ) AS change
            WHERE (name ILIKE '%${input}%' OR category ILIKE '%${input}%') AND (sale LIKE '1%' OR sale LIKE '-%') LIMIT 15;`);
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
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
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
                cata.category,
                SUM(sd.stock) AS allStock
            FROM
                products AS p
            LEFT JOIN catalogue AS cata ON p.id_category::INTEGER = cata.id_category
            JOIN size_division AS sd ON p.id = sd.id
            WHERE
                p.id = ${id}
            GROUP BY
                p."id", cata.category;
            `);

            let relateProducts = await con.any(`
            SELECT DISTINCT ON (relation) * FROM 
            (
                SELECT id_category FROM products WHERE id = ${id}
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
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            let rs;
            if (type === "nam") {
                rs = await con.any(`SELECT DISTINCT ON (relation) * FROM 
                (
                    SELECT * FROM products
                    LEFT JOIN catalogue AS cata ON products.id_category::INTEGER = cata.id_category
                ) AS change
                WHERE "for" = 'Nam'`);
            } else if (type === "nữ") {
                rs = await con.any(`SELECT DISTINCT ON (relation) * FROM 
                (
                    SELECT * FROM products
                    LEFT JOIN catalogue AS cata ON products.id_category::INTEGER = cata.id_category
                ) AS change
                WHERE "for" = 'Nữ'`);
            } else if (type === "giảm-giá") {
                rs = await con.any(`SELECT DISTINCT ON (relation) * FROM 
                (
                    SELECT * FROM products
                    LEFT JOIN catalogue AS cata ON products.id_category::INTEGER = cata.id_category
                ) AS change
                WHERE sale LIKE '1%' OR sale LIKE '-%'`);
            } else if (type === "thể-thao") {
                rs = await con.any(`SELECT DISTINCT ON (relation) * FROM 
                (
                    SELECT * FROM products
                    LEFT JOIN catalogue AS cata ON products.id_category::INTEGER = cata.id_category
                ) AS change
                WHERE category ILIKE '%sport%'`);
            } else if (type === "sản-phẩm-mới") {
                rs = await con.any(`SELECT DISTINCT ON (relation) * FROM 
                (
                    SELECT * FROM products
                    LEFT JOIN catalogue AS cata ON products.id_category::INTEGER = cata.id_category
                ) AS change
                WHERE sale ILIKE '%New arrival%'`);
            } else {
                rs = await con.any(`SELECT DISTINCT ON (relation) * FROM 
                (
                    SELECT * FROM products
                    LEFT JOIN catalogue AS cata ON products.id_category::INTEGER = cata.id_category
                ) AS change
                WHERE (name ILIKE '%${type}%' OR category ILIKE '%${type}%')`);
            }
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
    getFilterProducts: async (catalogue, typeProducts, typePrice, typeStars, gender, page) => {
        try {
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            let getCatalogue = catalogue === 'Tất cả' ? '%%' : catalogue;
            let getTypeProducts1;
            let getTypeProducts2;
            let getSold = 0;
            if (typeProducts === 'Tất cả') {
                getTypeProducts1 = '%';
                getTypeProducts2 = '%';
            } else if (typeProducts === '1') {
                getTypeProducts1 = 'New arrival';
                getTypeProducts2 = 'New arrival';
            } else if (typeProducts === '2') {
                getTypeProducts1 = '-%';
                getTypeProducts2 = '1%';
            } else if (typeProducts === '3') {
                getSold = 800;
                getTypeProducts1 = '%';
                getTypeProducts2 = '%';
            }
            let getTypePrice1;
            let getTypePrice2;
            if (typePrice === 'Tất cả') {
                getTypePrice1 = 0;
                getTypePrice2 = Number.MAX_SAFE_INTEGER;
            } else if (typePrice === '1') {
                getTypePrice1 = 0;
                getTypePrice2 = 50000;
            } else if (typePrice === '2') {
                getTypePrice1 = 50000;
                getTypePrice2 = 100000;
            } else if (typePrice === '3') {
                getTypePrice1 = 100000;
                getTypePrice2 = 200000;
            } else if (typePrice === '4') {
                getTypePrice1 = 200000;
                getTypePrice2 = 300000;
            } else if (typePrice === '5') {
                getTypePrice1 = 300000;
                getTypePrice2 = 400000;
            } else if (typePrice === '6') {
                getTypePrice1 = 400000;
                getTypePrice2 = 500000;
            } else if (typePrice === '7') {
                getTypePrice1 = 500000;
                getTypePrice2 = Number.MAX_SAFE_INTEGER;
            }
            gender = gender === 'Tất cả' ? '%' : gender;
            let rs = await con.any(`
            SELECT DISTINCT ON (relation) * FROM 
            (
                SELECT * FROM products
                LEFT JOIN catalogue AS cata ON products.id_category::INTEGER = cata.id_category
            ) AS change
            WHERE category LIKE $1 AND (sale LIKE $2 OR sale LIKE $3) AND price * 23000 >= $4 AND price * 23000 < $5 AND stars >= $6 AND stars < $7 AND "for" LIKE $8 AND sold > $9
            ORDER BY sold
            `, [getCatalogue, getTypeProducts1, getTypeProducts2, getTypePrice1, getTypePrice2, parseInt(typeStars), parseInt(typeStars) + 1, gender, getSold]);
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
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
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
    getComment: async (id) => {
        try {
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            const rs = await con.any(`SELECT * FROM comments WHERE id = ${id}`);
            return rs;
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    addComment: async (info, username) => {
        try {
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            await con.any(`INSERT INTO comments VALUES($1, $2, $3, $4, $5)`, [username, info.commentVal, parseInt(info.numStars), parseInt(info.id), info.time]);
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getStatsProductsAdd: async () => {
        try {
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            let rs = await con.any(`SELECT year, COUNT(year) AS amount FROM
            (SELECT EXTRACT(YEAR FROM create_date) AS year FROM products)
            GROUP BY year ORDER BY year`);
            return rs;
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getStatsRevenueYear: async () => {
        try {
            con = await db.connect();
            let rs = await con.any(`SELECT year, SUM(sold * price) AS amount FROM
            (SELECT EXTRACT(YEAR FROM create_date) AS year, sold, price FROM products)
            GROUP BY year ORDER BY year`);
            return rs;
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getStatsBestSeller: async () => {
        try {
            con = await db.connect();
            let rs = await con.any(`SELECT * FROM products ORDER BY sold DESC LIMIT 5`);
            return rs;
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    add: async (tbName, obj) => {
        let con = null;
        try {
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            if (tbName !== "accounts") {
                const rs = await con.one(`SELECT MAX(${tbName === "catalogue" ? "id_category" : "id"}) FROM ${tbName}`);
                if (tbName === "catalogue") obj.id_category = rs.max + 1;
                else obj.id = rs.max + 1;
            }
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
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            let rs;
            if (tbName === "catalogue") {
                rs = await con.any(`SELECT A.*, COUNT(B.id_category) AS amount FROM catalogue A LEFT JOIN products B ON A.id_category = B.id_category::int GROUP BY A.id_category, A.category ORDER BY id_category`);
            }
            else if (tbName === "products") {
                rs = await con.any(`SELECT A.*, B.category AS categoryname FROM products A LEFT JOIN catalogue B ON A.id_category::int = B.id_category ORDER BY A.id_category, A.id`);
            }
            else {
                rs = await con.any(`SELECT * FROM "${tbName}" ORDER BY ${order}`);
            }
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
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
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
    updateCat: async (data) => {
        let con = null;
        try {
            con = await db.connect();
            const condition = pgp.as.format(' WHERE id_category = ${id_category}', data);
            let sql = pgp.helpers.update(data, ['category'], 'catalogue') + condition;
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
    updatePro: async (data) => {
        let con = null;
        try {
            con = await db.connect();
            const condition = pgp.as.format(' WHERE id = ${id}', data);
            let sql = pgp.helpers.update(data, ['name', 'create_date', 'brand', 'color', 'images', 'price', 'description', 'sale', 'for', 'id_category'], 'products') + condition;
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
    updateBalance: async (tbName, un, amount) => {
        let con = null;
        try {
            con = await db.connect();
            const rs = await con.one(
                `UPDATE "${tbName}" SET totalmoney = totalmoney + ${amount} WHERE username = $1 RETURNING totalmoney`,
                [un]
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
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
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
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();

            const username = paymentJson.username;
            const totalmoney = parseFloat(paymentJson.totalmoney);

            con = await db.connect();
            const check = await con.any(`SELECT * FROM "${tbName}" WHERE "totalmoney" >= $1 AND "username" = $2`,
            [totalmoney, username]);

            if (!check.length) return "insufficient";

            await con.query(`
                UPDATE "${tbName}" SET "totalmoney" = "totalmoney" - $1 WHERE "username" = $2`,
                [totalmoney, username]
            );
            await con.query(`
                DELETE FROM cart WHERE "username" = $1`,
                [username]
            );

            return "success";
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    createPaymentAccount: async (tbName, obj) => {
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
    deletePaymentAccount: async (tbName, un) => {
        let con = null;
        try {
            con = await db.connect();
            await con.none(`DELETE FROM "${tbName}" WHERE username = $1`, [un]);
            return 1;
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    },
    getAllEmail: async (tbName, fieldName, value) => {
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
    update: async (tbName, fn, email, dob, un) => {
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
    },
    addProductToCart: async (tbName, obj) => {
        let con = null;
        try {
            con = await db.connect();
            let sql = pgp.helpers.insert(obj, null, tbName);
            await con.none(sql);
            return 1;
        } catch (error) {
            throw error;
        } finally {
            if (con) con.done();
        }
    },
    modifyQuantityInCart: async (tbName, username, product_id, size, quantity) => {
        let con = null;
        try {
            con = await db.connect();
            const rs = await con.query(`
                update "${tbName}"
                set "quantity" = $1
                where "username" = $2 and "product_id" = $3 and "size" = $4
            `, [quantity, username, product_id, size]);
            return rs;
        } catch (error) {
            throw error;
        } finally {
            if (con) con.done();
        }
    },
    checkExistProductInCart: async (tbName, username, product_id, size) => {
        let con = null;
        try {
            con = await db.connect();
            const rs = await con.query(`
                select count(id)
                from ${tbName} 
                where "username" = $1 and "product_id" = $2 and "size" = $3;
            `, [username, product_id, size]);
            const rowCount = rs[0].count;
            return rowCount;
        } catch (error) {
            throw error;
        } finally {
            if (con) con.done();
        }
    },
    getProductFromCart: async (tbName, fieldName, value) => {
        let con = null;
        try {
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
            con = await db.connect();
            const rs = await con.any(
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
    resetpw:  async (tbName, pw, un) => {
        let con = null;
        try {
          con = await db.connect();
          const result = await con.query(
            `UPDATE "${tbName}" SET "password" = $1 WHERE "username" = $2;`,
            [pw, un]
          );
          return result;
        } catch (error) {
          throw error;
        } finally {
          if (con) con.done();
        }
    },
    addToOrders: async (tbName, obj) => {
        let con = null;
        try {
            cn.database = process.env.DB_NAME;
            db = pgp(cn);
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
    }
}