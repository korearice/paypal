var request=require('request');
var express=require('express');
var app=express();
var CLIENT='AZKPwY23T6kuwx1FhWgzd__ipnsj1w1sgCC8D0mZFTLXd93Qswo-ayozWPpudaVeEddxWnpsZ2gZb1uL';
var SECRET='EItNHsaGoU-KDo3NZlWTy0meWgvo9b4Jf9ElMep9CEOMLZaOHtP5kEGrpJdIFI-5yci2XTcfNpAzH0Vg';
var PAYPAL_API='https://api-m.sandbox.paypal.com';

app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 8080);
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('events').EventEmitter.prototype._maxListeners = 100;

// Main Page
app.get('/', function(req, res, next){
	res.sendFile(__dirname+'/public/index.html');
});

// Set up the payment
app.post('/create-payment', function(req, res, next){
	request.post(PAYPAL_API + '/v1/payments/payment',
	{
		auth: {
			user: CLIENT,
			pass: SECRET
		},
		body: JSON.parse(req.body.data),
		json: true
	}, function(err, response) {
		if (err) {
			console.error(err);
			return res.sendStatus(500);
		}
		res.json({id: response.body.id});
	});
});

// Excute: Finalize the payment
app.post('/execute-payment', function(req, res, next){
	var paymentID = req.body.paymentID;
	var payerID = req.body.payerID;
	request.post(PAYPAL_API + '/v1/payments/payment/' + paymentID + '/execute',
	{
		auth: {
			user: CLIENT,
			pass: SECRET
		},
		body: {
			payer_id: payerID
		},
		json: true
	},
	function(err, response) {
		if (err) {
			console.error(err);
			return res.sendStatus(500);
		}
		res.json({status: 'success'});
	});
});

app.listen(app.get('port'), function(){
	console.log('Express server listening at port '+app.get('port'));
});