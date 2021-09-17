const { User, Product, favourites } = require('../../db.js');


async function addFavs(req, res, next) {
    const { idProduct } = req.body
    const {iduser} = req.headers
    try {        
        const userE = await User.findByPk(iduser)
        await userE.addProduct(idProduct)
        
        const fav = await User.findOne({
            where: {
                id: iduser
            },
            include: Product
        })        
        return res.status(200).json(fav)
    } catch (error) {
        return next(error)
    }
}

const quitFav= async(req, res, next) => {
    const {idProduct} = req.body
    const {iduser} = req.headers
    try{
        // const user = User.findByPk(iduser)
        // await user.remove Product(idProduct)
        await favourites.destroy({where: {
            UserId: iduser,
            ProductId: idProduct
        }})
        return res.send('se borro')
    } catch(error){
        next(error)
    }
}

const getFavs = async(req, res, next) => {
    const {iduser} = req.headers
    try {
        const user = await User.findByPk(iduser, {include: Product})
        return res.json(user)
    }catch(error){
        next(error)
    }
}
module.exports = {
    addFavs,
    quitFav,
    getFavs
}