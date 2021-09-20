const nodemailer = require('nodemailer');
require('dotenv').config();
const { GMAIL_USER, GMAIL_PASS } = process.env;

async function sendEmail(clientName, clientEmail, reason, link) {
    // Valido que a esta función le lleguen los datos necesarios.
    if (!clientName) return console.log('You must specify the client´s name.');
    if (!clientEmail) return console.log('You must specify the client´s Email.');
    if (!reason) return console.log('You must specify a reason for the Email.');

    // Controlo que la razon del email sea una razon válida.
    if (!['purchase', 'delivery', 'reset-password'].includes(reason)) {
        return res.status(404).send({ error: 'The reason parameter is invalid' });
    }

    // Datos para el login de la cuenta emisora del email, es decir, la cuenta de email de Bodegas Del Sur.
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',   // Servidor SMTP de gmail.
        port: 465,        // El puerto del servidor SMTP de Gmail predeterminado es 465 para SSL y 587 para TSL. (defaults to 587 if is secure is false or 465 if true)
        secure: true,     // Secure significa si se va a usar SSL en el envío del email.
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASS,
        }
    })

    let emailSubject = '';
    let emailMessaje = '';

    // Defino el asunto y el mensaje del Email.
    switch (reason) {
        case 'purchase':
            emailSubject = 'Confirmación de compra.';
            emailMessaje = 'Le informamos que su compra en Bodegas Del Sur mediante Mercado Pago se ha efectuado exitosamente.';
            break;
        case 'delivery':
            emailSubject = 'Confirmación de envío.';
            emailMessaje = 'Le informamos que los productos de su compra se encuentran en viaje a su domicilio.';
            break;
        case 'reset-password':
            emailSubject = 'Link para generar nueva contraseña.';
            emailMessaje = 'Le enviamos este link para que acceda al formulario de reinicio de contraseña.';
            break;
        default:

    }

    // Defino la estructura del Email.
    var mailStructure = {
        from: 'Bodegas Del Sur <bodegasdelsur.info@gmail.com>',
        to: clientEmail,
        subject: emailSubject,
        html: `
        <span>Estimado, ${clientName}</span>
        <p>${emailMessaje}</p>
        <p>${reason === 'reset-password' ? link : null}</p>
        <br>
        <br>
        <img src='https://res.cloudinary.com/bodegas-del-sur/image/upload/v1631902712/BodegasDelSur/banner_mail_nbtei2.jpg' alt="Imagen en email" width="400" height="72" />
        <br>
        <br>
        <h1 style="color: #0000ff"><b>Bodegas Del Sur</b></h1>
              `
    }

    // Envío el Email.
    await transporter.sendMail(mailStructure, (error, info) => {
        if (error) {
            res.status(500).send(error.message);
        } else {
            console.log('The Email was sent!');
            res.status(200).json(info);
        }
    })
};


module.exports = { sendEmail };


// El siguinte mensaje aparece cuando no se a provisto un user y pass correctos, o cuando NO se ha configurado la cuenta emisora de gmail para permitir loging por aplicaciones externas.
// Invalid login: 535-5.7.8 Username and Password not accepted.