const { User} = require('../../db');
const { v4: uuidv4 } = require('uuid');


async function newUser(req, res, next) {

    if (!req.body.displayName || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Bad request' })        

    console.log('esta entrando en la funcion')
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Bad request' })

    }
    const photoURL="https://i.imgur.com/vfrW9Xx.png";
    if(req.body.photoURL)photoURL=req.body.photoURL
    const { email, name, password} = req.body
    console.log('esta haciendo destructuring')
    const  id=uuidv4();
    let user={id,email,name,password,admin:false,photoURL};
    try {
        const exist = await User.findOne({where:{email:user.email}})
        console.log('valida el email')
        if (exist) { return res.status(500).send({ message: 'El email ya existe.' }) }
        const exist2 = await User.findOne({ where: { name: user.name } })
        console.log('valida el name')
        if (exist2 !== null) { return res.status(500).json({ message: 'El nombre de usuario ya existe.' }) }
        const id = uuidv4()
        console.log('valida si existe')
        
        await User.create(user)
        return res.send(user)
    } catch (error) {
        return res.status(500).json({ message: 'Error with DB' })
    }
}

async function updateUser(req, res, next) {
    const { idUser} = req.body
    try {
        const user = await User.findByPk(idUser)
        req.body.name ? user.name = req.body.name : '';
        req.body.password ? user.password=req.body.password:'';
        req.body.photoURL?user.photoURL=req.body.photoURL:'';
        user.save()
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: 'Error with DB' })
    };
};


async function getAllUsers(req, res, next) {
    let {name, admin} = req.query
    if(name === 'undefined') name = ''
    if(admin === 'undefined') admin = undefined
    try {
        const user = await User.findAll();
        return res.send(user)
    } catch (error) {
        next({ message: 'Bad Request' })
    }
}

async function deleteUser(req, res, next) {
    if (!req.params.idUser) {
        return res.status(400).json({ message: 'ID of the user is needed', status: 400 })
    }
    const { idUser } = req.params;
    try {
        const local=await User.findByPk(idUser);
        if(!local) return res.send('El usuario no existe.')
        await User.destroy({
            where: {
                id: idUser
            }
        })
        return res.send('The user has been deleted.')
    } catch (error) {
        next(error);
    }
}



async function loginUser(req, res, next) {
    const {email, name, password} = req.body
    if(name) {
        try {
            const isUser = await User.findOne({
                where: {
                email
                }
            })
            if (!isUser) {
                return res.send('Inexistent User')
            }
            else if(isUser.password!==password){
                return res.send('Invalid Password')
            }
            else return res.send(isUser)
        } catch (err) {
            next(err)
        }
    }
}


module.exports = {
    updateUser,
    getAllUsers,
    deleteUser,
    loginUser,
    newUser
}