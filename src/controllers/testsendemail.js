const { sendEmail } = require('./sendEmail');

// El proposito de este archivo es el de solo para ejecutarlo en desarrollo para probar el funcionamiento del controller 'sendEmail.js'
sendEmail('Juan Perez', 'juan123456789@gmail.com', 'delivery', 'https://www.youtube.com');


// Valores validos para el tercer parámetro: 'purchase', 'delivery', 'reset-password'
// Si el tercer parámetro es 'reset-password', se debe especificar un cuarto parametro con el link hacia la pagina donde se ingresa el nuevo password del usuario.
