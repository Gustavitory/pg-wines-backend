const { User, Product, Order, OrderProduct } = require('../../db.js');
const { sendEmail } = require('../sendEmail');
const { Op } = require('sequelize')

const exclude = ['createdAt', 'updatedAt']

const getAllOrders = async (req, res, next) => {
    let {status, shippingStatus} = req.query
    if(status === '' || status === 'undefined') status = null
    if(shippingStatus === '' || shippingStatus === 'undefined') shippingStatus = null
    const where = status && shippingStatus ?
    {
        status,
        shippingStatus
    } : !status && shippingStatus ?
    {
        shippingStatus
    } : status && !shippingStatus ?
    {
        status
    } : {}
    try {
        const orderByStatus = await Order.findAll(
            {
                where,
                include: {
                    model: User,
                    attributes: {
                        exclude: [...exclude, 'hashedPassword']
                    }
                },
                order: ['id']
            }
        )
        return res.send(orderByStatus)
    } catch (error) {
        next(error);
    }
};

const userOrders = async (req, res, next) => {
    const {idUser} = req.params
    console.log(idUser)
    try {
        const userOrders = await Order.findAll({
            where: {
                userId: idUser,
                status: 'cart'
            },
            include:{
                model: Product
            }
        })
        if (!userOrders.length) {
            return res.status(201).send({ error:'The required user has no order' })
        }
        return res.send(userOrders)
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    const { id } = req.params
    try {
        const order = await Order.findAll({
            where: {
                id
            },
            attributes: {
                exclude
            },
            include: {
                model: Product,
                attributes: {
                    exclude
                },
                through: {
                    model: OrderProduct,
                    attributes: []
                }
            }
        })
        return res.send(order)
    } catch (error) {
        next(error)
    }
};

const updateOrder = async (req, res, next) => {
    const { id } = req.params
    const { products } = req.body
    if (!id) return res.status(422).send({ error: 'The order id is required' })
    if (!products) return res.status(422).send({ error: 'The products to update are required'})
    try {
        const orderToDelete = await Order.findByPk(id)
        if (!orderToDelete) return res.status(404).send({ error: 'The id of the order sent is invalid' })
        const UserId = orderToDelete.UserId
        const user = await User.findByPk(UserId);
        if (!user) return res.status(404).send({ error: 'User is invalid' });
        const verifiedProductsPromises = products.map(async productToAdd => {
            try {
                const product = await Product.findByPk(productToAdd.id);
                if (!product) {
                    return res.status(400).send({ error: 'The id of some of the products sent is invalid' }) 
                };
                if (product.stock < productToAdd.quantity) {
                    return res.status(404).send({ error: 'There is not enough stock of any of the products'})
                }
            } catch (error) {
                return error;
            }
        })
        const error = await Promise.all(verifiedProductsPromises).then(result => result).catch(err => err)
        const concatError = [...new Set(error.filter(element => element))].join('. ')
        if (concatError) return res.status(400).send(concatError)
        await orderToDelete.destroy()
        const order = await Order.create()
        await user.addOrder(order);
        await products.forEach(async productToAdd => {
            try {
                const product = await Product.findByPk(productToAdd.id);
                const quantity = Number(productToAdd.quantity);
                const price = product.price
                await product.addOrder(order, { through: { orderId: order.id, quantity, price } })
            } catch (err) {
                console.error(err)
            }
        })
        return res.send('The order was updated successfully')
    } catch (err) {
        return res.status(400).send(err)
    }
};


const updateOrderStatus = async (req, res, next) => {
    const {UserId} = req.params;
    const {status} = req.body;
    if (!UserId) return res.status(404).send({ error: 'User id is required' });
    if (!status) return res.status(404).send({ error: 'The status to update is required' });
    if(!['approved', 'cancelled','pending'].includes(status)) return res.status(404).send({ error: 'The status to update is invalid' });
    
    try {
        const orderToUpdate = await Order.findOne({
            where: {
                userId: UserId
            }
        })
        if (!orderToUpdate) return res.status(404).send({ error: 'The id of the order sent is invalid'});
        if(orderToUpdate.status === 'cart') {
            orderToUpdate.status = status
            await orderToUpdate.save()
        }
        if(status === 'approved') {
            orderToUpdate.shippingStatus === 'approved'
            await orderToUpdate.save()
        }
        console.log("orderToUpdate => " + JSON.stringify(orderToUpdate));
        return res.send("Go");
    } catch (err) {
        next(err)
    }
}

const updateShipStatus = async (req, res, next) => {
    const {name, email} = req.headers
    const {id} = req.body;
    const {status} = req.body; 
    console.log({name, email, id, status})   
    if (!id) return res.status(404).send({ error: 'The order id is required'});
    if (!status) return res.status(404).send({ error: 'The status to update is required' });
    if(!['uninitiated', 'processing','approved', 'cancelled'].includes(status)) return res.status(404).send({ error: 'The status to update is invalid' });
    try {
        const orderToUpdate = await Order.findOne({
            where: {
                id
            }
        })
        if (!orderToUpdate) return res.status(404).send({ error: 'The id of the order sent is invalid' });        
        orderToUpdate.shippingStatus = status
        await orderToUpdate.save()
        const orders = await Order.findAll({
            include: {
                model: User,
                attributes: {
                    exclude: [...exclude, 'hashedPassword']
                }
            },
            order: ['id']
        })
        const products = await Order.findOne({
            where: {
                id
            },
            include: {
                model: Product,
                attributes: {
                    exclude
                },
                through: {
                    attributes: []
                }
            },
        })
        let templateproductsshippingapproved = ''
        console.log("products: " + JSON.stringify(products))
        products.products.forEach(el => templateproductsshippingapproved+=`<li>${el.name}</li>`)
        if(status === 'approved') {
            const user = await User.findOne({
                where: {
                    id: orderToUpdate.userId
                }
            })
            sendEmail(user.name, user.email, false);  // Le envio un email al usuario correspondiente para avisarle que su compra ha sido despachada.
        }
        return res.send(orders)        
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getAllOrders,
    userOrders,
    getOrderById,
    updateOrder,
    updateOrderStatus,
    updateShipStatus
}