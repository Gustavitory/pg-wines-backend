require('dotenv').config();
const { Op } = require('sequelize');
const { Product,Category,Brand, Offer, Review } = require('../db');
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const fs = require('fs-extra');



const exclude= ['createdAt', 'updatedAt','categoryId','brandId']

async function getProducts(req, res) {
    let { name, categoryId,page,orderBy,orderType,initPrice,finalPrice, brand,itemsPerPage} = req.query;
    const validate = ['null', undefined, 'undefined', '']
    if(validate.includes(name))name="";
    if(validate.includes(itemsPerPage))itemsPerPage=10;
    if(validate.includes(brand))brand="";
    if(validate.includes(categoryId))categoryId='';
    if(validate.includes(orderBy))orderBy='name';
    if(validate.includes(orderType))orderType='asc'
    if(validate.includes(page))page=1;
    if(validate.includes(initPrice))initPrice=0;
    if(validate.includes(finalPrice))finalPrice=10000000;
    console.log(categoryId)
    try {
        const count = await Product.findAll({
            where:{
                name:{[Op.like]:`%${name}%`},
                cost: {[Op.between]:[initPrice,finalPrice]}
            },
            // offset: (page - 1) * itemsPerPage,
            // limit: itemsPerPage,
            include:[
                {
                    model: Category,
                    where: categoryId ? {
                        id: categoryId
                    } : null,
                    attributes: ['name', 'id']
                },
                {
                    model: Brand,
                    where: brand ? {
                        name: brand
                    } : null
                },
                {
                    model: Review,
                    attributes: ['comment', 'rating']
                }
            ],
            order:[[orderBy,orderType]]
        })
        // const products = await Product.findAll({
        //     where: {
        //         name: { [Op.iLike]: `%${name}%` },
        //         cost: {[Op.between]:[initPrice,finalPrice]}
        //     },
        //     attributes: {
        //         exclude
        //     },
        //     offset: (page - 1) * itemsPerPage,
        //     limit: itemsPerPage,
        //     include:[
        //         {
        //             model: Category,
        //             where: categoryId ? {
        //                 id: categoryId
        //             } : null,
        //             attributes: ['name', 'id']
        //         },
        //         {
        //             model: Brand,
        //             where: brand ? {
        //                 name: brand
        //             } : null
        //         },
        //         {
        //             model: Review,
        //             attributes: ['comment', 'rating']
        //         }
        //     ],
        //     order:[[orderBy,orderType]]
        // })

        //start: set discount only if it found an offer
        const fechaActual = new Date();
        let offers;
        let result = [];
        const products = count;
        for (var i=0; i<products.length; i++) {
            offers = await Offer.findAll({
                where: {
                    categoryId: products[i].category.id,
                    from: {
                        [Op.lte]: fechaActual
                    },
                    until: {
                        [Op.gte]: fechaActual
                    }
                }
            });
            if (offers.length !== 0) {
                products[i] = {
                    id: products[i].id,
                    name: products[i].name,
                    stock: products[i].stock,
                    cost: products[i].cost,
                    discount: offers[0].discount,
                    offerDays: offers[0].offerDays,
                    description: products[i].description,
                    capacity: products[i].capacity,
                    image: products[i].image,
                    sales: products[i].sales,
                    category: products[i].category,
                    brand: products[i].brand,
                    packing: products[i].packing
                }
            } 
            result.push(products[i]);
        }
        // result = products.map(async (elem, index) => {
        //     offers = await Offer.findAll({
        //         where: {
        //             categoryId: elem.category.id,
        //             from: {
        //                 [Op.lte]: fechaActual
        //             },
        //             until: {
        //                 [Op.gte]: fechaActual
        //             }
        //         }
        //     });
        //     if (offers.length !== 0) {
        //         elem = {
        //             id: elem.id,
        //             name: elem.name,
        //             stock: elem.stock,
        //             cost: elem.cost,
        //             discount: offers[0].discount,
        //             description: elem.description,
        //             capacity: elem.capacity,
        //             image: elem.image,
        //             sales: elem.sales,
        //             category: elem.category,
        //             brand: elem.brand,
        //             packing: elem.packing
        //         }
        //     } 
        // });
        //end: set discount only if it found an offer

        console.log("count.length: "+count.length)
        console.log("itemsPerPage: "+itemsPerPage)
        return res.status(200).send({totalPage:Math.ceil(count.length/itemsPerPage), products: result})
    } catch (err) {
        console.log('ERROR in getProducts', err);
    }
}



async function getProductById(req, res) {
    const { id } = req.params;
    try {
        if (!id) return res.status(422).send({ error: 'The product id is required' });
        let productById = await Product.findByPk(id,
            {
                include: ["category", "brand", "packing"],
            })
        const fechaActual = new Date();
        const offers = await Offer.findAll({
            where: {
                categoryId: productById.category.id,
                from: {
                    [Op.lte]: fechaActual
                },
                until: {
                    [Op.gte]: fechaActual
                }
            }
        });
        if (offers.length !== 0) {
            productById = {
                id: productById.id,
                name: productById.name,
                stock: productById.stock,
                cost: productById.cost,
                discount: offers[0].discount,
                offerDays: offers[0].offerDays,
                //daysUntilFinishDiscount: Math.floor((offers[0].until - fechaActual)/(1000*60*60*24)),
                description: productById.description,
                capacity: productById.capacity,
                image: productById.image,
                sales: productById.sales,
                category: productById.category,
                brand: productById.brand,
                packing: productById.packing
            }
        }
        return res.send(productById)
    } catch (err) {
        console.log('ERROR in getProductById', err);
        res.status(404).send({ error: 'The product id is wrong' });
    }
}

async function postProduct(req, res) {
    //required fields: name, cost, capacity, categoryId, brandId, packingId
    //non required fields:  stock=0, description="", image=[], sales=0, 
    const { 
        name, cost, capacity, categoryId, brandId, packingId,
        stock, description, sales 
    } = req.body;
    const image = req.files ? req.files : undefined;
    try {
        if (name && cost && capacity && categoryId && brandId && packingId) {
            var result = [];
            if (image) {
                for (i=0; i<image.length; i++) {
                    result[i] = await cloudinary.v2.uploader.upload(req.files[i].path);
                    await fs.unlink(req.files[i].path);
                }
                result = result.map(elem => elem.secure_url);
            }
            var createdProduct = await Product.create({
                name,
                stock,
                cost,
                description,
                capacity,
                image: image ? result : [],
                sales
            });
            await createdProduct.setCategory(categoryId);
            await createdProduct.setBrand(brandId);
            await createdProduct.setPacking(packingId);
            res.send(createdProduct);
        } else {
            res.status(422).send({ error: 'These data are required: name, cost, capacity, categoryId, brandId, packingId' })
        }
    } catch (err) {
        console.log('ERROR in postProduct', err);
    }
}

async function updateProduct(req, res) {
    //required fields: name, cost, capacity, categoryId, brandId, packingId
    //non required fields:  stock=0, description="", image=[], sales=0, 
    const { 
        id, name, cost, capacity, categoryId, brandId, packingId,
        stock, description, image, sales
    } = req.body;
    if (!id) return res.status(422).send({ error: 'The product id is required' });
    if (!name && !stock && !cost && !description && !capacity && !image && !sales && !categoryId && !brandId && !packingId) {
        return res.status(422).send({ error: 'You should specified at least one valid field.' });
    }
    try {
        const product = await Product.findByPk(id);
        if (!product) return res.status(422).send({ error: 'The product id is wrong' });
        if (name) { product.name = name }
        if (description) { product.description = description }
        if (stock) { product.stock = stock }
        if (cost) { product.cost = cost }
        if (capacity) { product.capacity = capacity }
        if (image) { product.price = image }
        if (sales) { product.sales = sales }
        if (categoryId) { product.categoryId = categoryId }
        if (brandId) { product.brandId = brandId }
        if (packingId) { product.packingId = packingId }
        await product.save();
        return res.send('The product has been updated suscesfully');
    } catch (err) {
        console.log('ERROR in updateProduct', err);
    }
}
async function deleteProduct(req, res) {
    const { id } = req.body;
    if (!id) return res.send({ error: 'The product id is required' })
    const prod = await Product.findByPk(id)
    if (!prod) return res.send({ error: 'The product does not exist' })
    try {
        await Product.destroy({
            where: {
                id
            }
        })
        return res.send('The product was removed successfully')
    } catch (err) {
        console.log('ERROR in deleteProduct', err);
    }
}





module.exports = {
    getProducts,
    getProductById,
    postProduct,
    updateProduct,
    deleteProduct
}