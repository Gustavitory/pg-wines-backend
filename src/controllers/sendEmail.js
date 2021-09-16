const nodemailer = require('nodemailer');
require('dotenv').config();
const { GMAIL_USER, GMAIL_PASS } = process.env;

async function sendEmail(clientName, clientEmail, newPurchase = true) {   // newPurchase = true, hace referencia a confirmacion de una nueva compra. En otro caso hace rferencia a confirmación de envío.
    // Valido que a esta función le lleguen los datos necesarios.
    if (!clientName) return console.log('You must specify the client´s name.');
    if (!clientEmail) return console.log('You must specify the client´s Email.');

    // Datos para el login a la cuenta emisora del email.
    var transporter = nodemailer.createTransport({      
        host: 'smtp.gmail.com',   // Servidor SMTP de gmail.
        port: 465,        // El puerto del servidor SMTP de Gmail predeterminado es 465 para SSL y 587 para TSL. (defaults to 587 if is secure is false or 465 if true)
        secure: true,     // Secure significa si se va a usar SSL en el envío del email.
        auth: {
            user: GMAIL_USER, 
            pass: GMAIL_PASS,
        }
    })

    // Defino el asunto y el mensaje del Email.
    let emailSubject = 'Confirmación de compra.';
    let emailMessaje = 'Le informamos que su compra en Bodegas Del Sur mediante Mercado Pago se ha efectuado exitosamente.';
    if (!newPurchase) {
        emailSubject = 'Confirmación de envío.';
        emailMessaje = 'Le informamos que los productos de su compra se encuentran en viaje a su domicilio.';
    }

    // Defino la estructura del Email.
    var mailStructure  = {
        from: 'Bodegas Del Sur <bodegasdelsur.info@gmail.com>',
        to: clientEmail,
        subject: emailSubject,
        html: `
        <span>Estimado, ${clientName}</span>
        <p>${emailMessaje}</p>
        <br>
        <br>
        <img src='https://www.conosur.com/wp-content/uploads/2018/08/pinot-noir.png' alt="Imagen en email" width="300" height="150" />
        <br>
        <br>
        <h1 style="color: #0000ff"><b>Bodegas Del Sur</b></h1>
              `
    }

    // Envío el Email.
    await transporter.sendMail(mailStructure , (error, info) => {
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