require('dotenv').config();
const { Offer, Product } = require('../db');
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const fs = require('fs-extra');


async function getOffers(req, res) {
    try {
        const offers = await Offer.findAll()
        return res.send(offers);
    } catch (err) {
        console.log('ERROR in getOffers', err);
    }
}

async function postOffer(req, res) {
    const { status, categoryId, discount, from, until, slug } = req.body;
    const image = req.file? req.file.filename : undefined;
    try {
        if (status && image && categoryId && discount && from && until) {
            const result = await cloudinary.v2.uploader.upload(req.file.path);
            const createdOffer = await Offer.create({
                status,
                image: result.secure_url,
                discount,
                from,
                until,
                slug
            });
            createdOffer.setCategory(categoryId);         
            await fs.unlink(req.file.path);         
            
            //start: set discount to all products from categoryId
            const products = await Product.findAll({
                where: {
                    categoryId: categoryId
                }
            });
            products.map(elem => {
                elem.discount = discount;
                elem.save();
            });
            //end: set discount to all products from categoryId

            res.send(createdOffer);
        } else {
            res.status(422).send({ error: 'Fields status, image and categoryId are required' })
        }
    } catch (err) {
        console.log('ERROR in postOffer', err);
    }
}

async function updateOffer(req, res) {
    const { id, status, categoryId, discount, from, until, slug } = req.body; 
    const image = req.file? req.file.filename : undefined;
    if (!id) return res.status(422).send({ error: 'The offer id is required' });

    try {
        const offer = await Offer.findByPk(id);
        if (!offer) return res.status(422).send({ error: 'The offer id is wrong' });
        status ? offer.status = status : offer.status = offer.status;
        image ? offer.image = image : offer.image = offer.image;
        categoryId ? offer.categoryId = categoryId : offer.categoryId = offer.categoryId;
        discount ? offer.discount = discount : offer.discount = offer.discount;
        from ? offer.from = from : offer.from = offer.from;
        until ? offer.until = until : offer.until = offer.until;
        slug ? offer.slug = slug : offer.slug = offer.slug;
        await offer.save();
        return res.send('The offer has been updated suscesfully');
    } catch (err) {
        console.log('ERROR in updateOffer', err);
    }
}

async function deleteOffer(req, res) {
    const { id } = req.body;
    if (!id) return res.send({ error: 'The offer id is required' })
    const offer = await Offer.findByPk(id)
    if (!offer) return res.send({ error: 'There is not any offer with this id' })
    try {
        await Offer.destroy({
            where: {
                id
            }
        })
        return res.send('The offer was removed successfully')
    } catch (err) {
        console.log('ERROR in deleteOffer', err);
    }
}

module.exports = {
    getOffers,
    postOffer,
    updateOffer,
    deleteOffer
}