const { User } = require('../db');
const { sendEmail } = require('./sendEmail');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { JWT_SECRET } = process.env;

// Esto se ejecutará cuando se presione 'Submit' en el formulario en el que el usuario ingresa su email para que se le envie el link.
async function forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) return res.status(422).send({ error: 'An email is required' })

    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        });
        if (!user) return res.status(404).json({ error: 'There is no registered user with that email' });
    } catch (error) {
        console.log('ERROR in forgotPassword')
    }

    // Combinando mi clave secreata con información del usuario para generear un token único y de un solo uso.
    const secret = JWT_SECRET + user.password;
    const payload = {
        id: user.id,
        email: user.email
    }

    // Genero el token.
    const token = jwt.sign(payload, secret, { expiresIn: '10m' });

    // Genero el link para enviarselo al usuario a su email.
    const link = `https://abadalejandro.github.io/pg-wines-frontend/#/reset-password/${user.id}/${token}`;

    // Envio el email con el link al usuario.
    sendEmail(user.name, user.email, 'reset-password', link); 

}


module.exports = {
    forgotPassword
}