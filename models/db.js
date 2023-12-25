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
    port: process.env.PORT1,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PW,
    max: process.env.MAX,
};

const db = pgp(cn);

fs.readFile(filePath1, 'utf8')
    .then(fileContent => {
        data1 = JSON.parse(fileContent);
    })
    .catch(error => {
        console.error('Error reading or parsing the file:', error);
    })

fs.readFile(filePath2, 'utf8')
    .then(fileContent => {
        data2 = JSON.parse(fileContent);
    })
    .catch(error => {
        console.error('Error reading or parsing the file:', error);
    })


module.exports = {
    addDataToDB: async () => {
        let con = null;
        try {
            con = await db.connect();
            const check = await con.any('SELECT * FROM products');
            if (check.length > 0) {
                return;
            } else {
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
                        save.size = allSize[i]; // text
                        save.stock = Math.round(Math.random() * 400 + 40); // integer
                        try {
                            let sql = pgp.helpers.insert(save, null, 'products');
                            sql += " RETURNING id";
                            await con.one(sql);
                        } catch (error) {
                            console.log(error);
                            throw error;
                        }
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
                        save.size = allSize[i];
                        save.stock = Math.round(Math.random() * 400 + 40);
                        try {
                            let sql = pgp.helpers.insert(save, null, 'products');
                            sql += " RETURNING id";
                            await con.one(sql);
                        } catch (error) {
                            console.log(error);
                            throw error;
                        }
                    }
                }
            }
        } catch (error) {
            throw error;
        } finally {
            if (con) {
                con.done();
            }
        }
    }
}