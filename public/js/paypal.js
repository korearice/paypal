/**
* Description: Set paypal checkout button
*/
function initPaypalCheckout(buttonSelector){
	paypal.Button.render({
		env: 'sandbox', // Or 'production'
		style: {
			layout:  'vertical',
			color:   'blue',
			shape:   'rect',
			label:   'paypal',
			size:    'responsive'
		},
		payment: function(data, actions){
			return actions.request.post('/create-payment',
			{
				data : JSON.stringify(billingInfo)
			})
			.then(function(res) {
				return res.id;
			});
		},
		onAuthorize: function(data, actions){
			return actions.request.post('/execute-payment', {
				paymentID: data.paymentID,
				payerID:   data.payerID
			})
			.then(function(res) {
				actions.redirect();
			});
		},
		/* Keep to payment page
		onCancel: function(data, actions) {
			actions.redirect();
		} */
	}, buttonSelector);
}