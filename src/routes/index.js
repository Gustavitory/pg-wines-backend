const path = require('path');
const {Router} = require('express');
const products = require('./products');
const categories = require('./categories');
const brands = require('./brands');
const packing = require('./packing');
const user= require('./user');
const offers = require('./offers');
const resetDb = require('./resetDb');
const mercadoPago = require('mercadopago')

mercadoPago.configure({
    access_token: 'TEST-3476617001259774-091513-b3f9c1dbd722b4bf1f4c6b591295229b-402890618'
});


const router = Router();

router.use('/products', products);
router.use('/categories', categories);
router.use('/brands', brands);
router.use('/packing', packing);
router.use('/user',user);
router.use('/offers', offers);
router.use('/resetdb', resetDb);

router.post('/pay', (req, res)=>{

    const {product} = req.body
    //Product es un array de objetos
    let preference = {
        items: product,
        back_urls: {
			"success": "http://localhost:3001/feedback",
			"failure": "http://localhost:3001/feedback",
			"pending": "http://localhost:3001/feedback"
		},
		auto_return: 'approved',
      };
      
      mercadoPago.preferences.create(preference)
      .then(function(response){
      // Este valor reemplazará el string "<%= global.id %>" en tu HTML
        global.id = response.body.id;
        console.log(global)
        res.send({global})
      }).catch(function(error){
        console.log(error);
      });
})

router.get('/feedback', function(request, response) {
    response.json({
       Payment: request.query.payment_id,
       Status: request.query.status,
       MerchantOrder: request.query.merchant_order_id
   })
});

router.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
});

module.exports = router;
