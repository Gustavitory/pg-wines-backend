const { User, Product, Order, OrderProduct } = require('../../db.js');
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
            return res.status(201).send('El usuario requerido no tiene ninguna orden')
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
    } catch (err) {
        next(err)
    }
};

const updateOrder = async (req, res, next) => {
    const { id } = req.params
    const { products } = req.body
    if (!id) return res.status(400).send('El id de la orden es requerido')
    if (!products) return res.status(400).send('Los productos a actualizar son requeridos')
    try {
        const orderToDelete = await Order.findByPk(id)
        if (!orderToDelete) return res.status(400).send('El id de la orden enviada es inválido')
        const UserId = orderToDelete.UserId
        const user = await User.findByPk(UserId);
        if (!user) return res.status(400).send('El usuario es inválido')
        const verifiedProductsPromises = products.map(async productToAdd => {
            try {
                const product = await Product.findByPk(productToAdd.id);
                if (!product) {
                    return 'El id de alguno de los productos enviados es inválido'
                };
                if (product.stock < productToAdd.quantity) {
                    return 'No hay stock suficiente de alguno de los productos'
                }
            } catch (err) {
                console.error(err)
                return err
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
        return res.send('La orden fue actualizada con éxito')
    } catch (err) {
        return res.status(400).send(err)
    }
};


const updateOrderStatus = async (req, res, next) => {
    const {UserId} = req.params;
    const {status} = req.body;
    if (!UserId) return res.status(400).send('El id del usuario es requerido')
    if (!status) return res.status(400).send('El status a actualizar es requerido');
    if(!['approved', 'cancelled','pending'].includes(status)) return res.status(400).send('El status a actualizar es invalido');
    
    try {
        const orderToUpdate = await Order.findOne({
            where: {
                userId: UserId
            }
        })
        if (!orderToUpdate) return res.status(400).send('El id de la orden enviada es inválido');
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
    if (!id) return res.status(400).send('El id de la orden es requerida')
    if (!status) return res.status(400).send('El status a actualizar es requerido');
    if(!['uninitiated', 'processing','approved', 'cancelled'].includes(status)) return res.status(400).send('El status a actualizar es invalido');
    try {
        const orderToUpdate = await Order.findOne({
            where: {
                id
            }
        })
        if (!orderToUpdate) return res.status(400).send('El id de la orden enviada es inválido');        
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
            console.log("Hello");
            const user = await User.findOne({
                where: {
                    id: orderToUpdate.userId
                }
            })
            try {
                await axios(`http://localhost:3000/user/sendmail?type=shippingApproved`,{
                    headers: {
                        nameshippingapproved: name,
                        emailshippingapproved: email,
                        templateproductsshippingapproved,
                        // shippingAddress: user.shippingAddress
                        shippingaddress: 'Y eiaaaaa'
                    }
                })
            } catch(error) {
                console.error(error)
            }
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