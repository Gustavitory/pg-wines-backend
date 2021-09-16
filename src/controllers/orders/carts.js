const { User, Product, Order, OrderProduct } = require('../../db.js');
// const usersDBJson = require('../../bin/data/users.json')

const exclude = ['createdAt', 'updatedAt']

const addCartItem = async (req, res, next) => {
    const {idUser} = req.params
    const{id, quantity} = req.body
    if (!idUser) return next({message:"el ID no es correcto"})
    if (!quantity) return next({message:"la cantidad es requerida"})
    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return next({message:"Producto no encontrado"})
        };
        const quantityStock = Number(quantity);
        if (product.stock < quantityStock) {
            return next({mesaage: "No hay stock suficiente"})
        };
        const cost = product.cost        
        const user = await User.findOne({
            where: {
                id: idUser
            }
        });
        if (!user) {
            return next({message: "usuario no encontrado"})
        };
        let order = await Order.findOne({ where: { userId: idUser, status: 'cart' } });
        if (!order) {
            order = await Order.create()
            await user.addOrder(order);
        };
        console.log('--------hola1', order)
        
        let orderItem = await OrderProduct.findOne({
            where: {
                orderID: order.id,
                productID: id,
            }
        })
        if(!orderItem) {
            orderItem = await OrderProduct.create({
                orderID: order.id,
                productID: id,
                quantity,
                cost: product.cost
            })
        }
        else {
            orderItem.quantity+=quantity
            await orderItem.save()
        }
        const createdProduct = await Product.findOne({
            where: {
                id
            },
            attributes: {
                exclude
            }
        })
        await createdProduct.setDataValue('quantity', orderItem.quantity)
        return res.send(createdProduct);
    } catch (err) {
        console.error(err)
        next(err)
    }
};

const deleteCartEmpty = async (req, res, next) => {
    const { idUser } = req.params     
    try {
        const orderUser = await Order.findAll({
            where: {
                userId: idUser
            }
        })
        if(orderUser.length < 1) {            
            return next({message: "el ID es incorrecto"});
        }
        
        const cart = await Order.destroy({
            where: {
                userId: idUser
            },
        })
        return res.send('Todos los productos fueron removidos de tu carrito de compras')
    } catch (error) {       
        next(error);
    }
};

const getAllCartItems = async (req, res, next, idUser = null) => {
    try {       
        if (!req.params.idUser) return next({message: "el ID de usuario es requerido"})
        let order = await Order.findOne({
            where: {
                userId: req.params.idUser,
                status: 'cart'
            },
            attributes: {
                exclude
            }
        })
        if(!order) {
            order = await Order.create({
                userId: req.params.idUser,
            })
        }
        const raw_cart = await Product.findAll({
            include: { model: Order, where: { id: order.id } },
            order: ['name']
        })
        // console.log(req.params, 'req.params')
        if (!raw_cart.length) {
            // return next({ message: "Aún no tienes productos en tu carrito de compras" })
            return res.status(200).send({
                products: [],
                orderId: order.id
            })
        }

        let cart = []

        raw_cart?.map(i => {
            let prod = {};

            prod.id = i.id
            prod.name = i.name
            prod.description = i.description
            prod.cost = i.cost
            prod.photo = i.photo
            prod.stock = i.stock
            prod.selled = i.selled
            prod.perc_desc = i.perc_desc
            i.orders.map(j => {
                prod.quantity = j.orderProduct.quantity
            })
            cart.push(prod)
        })
        return res.status(200).send({
            products: cart,
            orderId: order.id
        })
    } catch (error) {
        next(error);
    }
};

const editCartQuantity = async (req, res, next) => {

    if (!req.params.idUser) return next({message: " El ID de usuario es requerido "})
    try {
        const user = await User.findByPk(req.params.idUser);
        if (!user) {
            return res.status(400).send("Usuario no encontrado")
        };
        const product = await Product.findByPk(req.body.id);
        const quantity = req.body.quantity;
        const cost = product.cost;
        let order = await Order.findOne({ where: { userId: req.params.idUser, status: 'cart' } });
        console.log({order})
        const updatedQuantity = await product.addOrder(order, { through: { orderID: order.id, quantity, cost } })
        return res.json({ message: "Producto actulizado correctamente" });
        next();
    } catch (error) {
        next(error)
    }
};

const deleteCartItem = async (req, res, next) => {
    const { idUser, idProduct } = req.params;
    if (!req.params.idUser) return res.json({message: " El ID de la orden y del producto son requeridos "})
    try {
        const orderId = await Order.findOne({ where: { userId: idUser, status: 'cart' } });
        if (!orderId) {
            return res.status(400).send("Orden no encontrado")
        };
        let order = await OrderProduct.findOne({ where: { orderID: orderId.dataValues.id, productID: idProduct } });
        if(!order) return next({message: " El ID de la orden y del producto son invalidos "});
        await OrderProduct.destroy({ where: { productID: order.dataValues.productID, orderID: orderId.dataValues.id } })
        return res.json({ message: "Item borrado" });
    } catch (error) {
        next(error);
    }
};

// async function fullDbOrders() {
//     try {
//         const products = await Product.findAll()
//         for (let i of usersDBJson) {
//             let productIndex1=0
//             let productIndex2=5
//             let productIndex3=10
//             try {
//                 const user = await User.findOne({
//                     where: {
//                         name: i.name
//                     }
//                 })
//                 let product1 = products[productIndex1++]
//                 let product2 = products[productIndex2++]
//                 let product3 = products[productIndex3++]
//                 const order = await Order.create()
//                 await user.addOrder(order);
//                 await OrderProduct.create({
//                     orderID: order.id,
//                     productID: product1.id,
//                     quantity: 1,
//                     cost: product1.cost
//                 })
//                 await OrderProduct.create({
//                     orderID: order.id,
//                     productID: product2.id,
//                     quantity: 1,
//                     cost: product2.cost
//                 })
//                 await OrderProduct.create({
//                     orderID: order.id,
//                     productID: product3.id,
//                     quantity: 1,
//                     cost: product3.cost
//                 })
//             } catch (error) {
//                 console.error(error);
//             }
//         }
//     } catch(err) {
//         console.error(err)
//     }
// }

module.exports = {
    addCartItem,
    deleteCartEmpty,
    getAllCartItems,
    editCartQuantity,
    deleteCartItem,
    // fullDbOrders
}