/**
* Description: Get product object by sku code
* @param {String} sku code
* @return {Object} Product Object
*/
function getProductBySku(sku){
	for(var i = 0; i < productItems.length; i++){
		if(productItems[i].sku === sku) return productItems[i];
	}
}

/**
* Description: Set quantity button event for created elements
* @param {HTMLElement} Dummy div elment for cart list
*/
function setButtonEvent(ele){
	// Quantity add
	ele.querySelector('._btn_qty_add').addEventListener('click', function(e){
		var sku = e.target.getAttribute('data-sku');
		var eleQty = document.querySelector('.' + sku + '_qty');
		var productObj = getProductBySku(sku);
		productObj.quantity += 1;
		eleQty.innerHTML = productObj.quantity;
	});

	// Quantity remove
	ele.querySelector('._btn_qty_remove').addEventListener('click', function(e){
		var sku = e.target.getAttribute('data-sku');
		var eleQty = document.querySelector('.' + sku + '_qty');
		var productObj = getProductBySku(sku);
		if(productObj.quantity > 0){
			productObj.quantity -= 1;
			eleQty.innerHTML = productObj.quantity;
		}
	});
}

/**
* Description: Set Cart list
* @param {Object.item} Products Arry
* @param {Object.container} Cart container element
* @param {Object.template} Cart markup template
*/
function initProducts(obj){
	for(var i = 0; i < obj.items.length; i++){
		var dummyElement = document.createElement('div');
		var dummyTemplate = obj.template;
		for(var key in obj.items[i]){
			var pattern = new RegExp('{' + key + '}','g');
			dummyTemplate = dummyTemplate.replace(pattern, obj.items[i][key]);
		}
		dummyElement.innerHTML = dummyTemplate;
		setButtonEvent(dummyElement);
		obj.container.append(dummyElement);
	}
}

/**
* Description: Set/Validate the billing information to checkout
* @return {Boolean} Return validation result
*/
function createBilling(){
	billingInfo = JSON.parse(JSON.stringify(transactionTemplate));
	var subtotal = 0;
	var tax = 0;
	for(var i = 0; i < productItems.length; i++){
		if(document.querySelector('.chk_sku_' + productItems[i].sku).checked && productItems[i].quantity > 0){
			subtotal += productItems[i].price * productItems[i].quantity;
			tax += productItems[i].tax * productItems[i].quantity;
			billingInfo.transactions[0].item_list.items.push(productItems[i]);
		}
	}
	if(subtotal > 0){
		var details = billingInfo.transactions[0].amount.details;
		details.subtotal = subtotal;
		details.tax = tax;
		for(var key in details){
			billingInfo.transactions[0].amount.total += details[key];
		}
		details.subtotal = details.subtotal.toFixed(2);
		details.tax = details.tax.toFixed(2)
		billingInfo.transactions[0].amount.total = billingInfo.transactions[0].amount.total.toFixed(2);
		return true;
	} else{
		return false;
	}
}

/**
* Description: Set/Validate the shipping information to checkout
* @return {Object.success} Return validation result
* @return {Object.field} Return failed field
*/
function createShippingInfo(){
	var eleInputs = document.querySelectorAll('._form_shipping[required]');
	for(var i = 0; i < eleInputs.length; i++){
		if(eleInputs[i].value.trim()){
			billingInfo.transactions[0].item_list.shipping_address[eleInputs[i].name] = eleInputs[i].value.trim();
		} else{
			return {success:false, field: eleInputs[i].placeholder};
		}
	}
	return {success:true};
}

/**
* Description: Set checkout billing summary markup
* @param {HTMLElement} Billing summary container element
*/
function setBillingSummary(ele){
	var billingSummary = 'Total Amount: ' + billingInfo.transactions[0].amount.currency + ' ' + billingInfo.transactions[0].amount.total + '<br>';
	billingSummary = billingSummary + JSON.stringify(billingInfo.transactions[0].amount.details).replace(/{|}|"/g,'').replace(/,/g,'<br>').replace(/_/g, ' ') + '<br>';
	ele.innerHTML = billingSummary;
}

/**
* Description: Set checkout product summary markup
* @param {HTMLElement} Product summary container element
*/
function setProductSummary(ele){
	var productSummary = '';
	var items = billingInfo.transactions[0].item_list.items;
	for(var i = 0; i < items.length; i++){
		productSummary = productSummary + '<div>' + JSON.stringify(items[i]).replace(/{|}|"/g,'').replace(/,/g,'<br>').replace(/_/g, ' ') + '</div>';
	}
	ele.innerHTML = productSummary;
}

/**
* Description: Set checkout shipping summary markup
* @param {HTMLElement} Shipping summary container element
*/
function setShippingSummary(ele){
	var shippingSummary = JSON.stringify(billingInfo.transactions[0].item_list.shipping_address).replace(/{|}|"/g,'').replace(/,/g,'<br>').replace(/_/g, ' ');
	ele.innerHTML = shippingSummary;
}

/**
* Description: Set Checkout/Cancel button event
* @param {Object.checkout} Checkout button element
* @param {Object.cancel} Cancel button element
* @param {Object.container} Checkout page container element
* @param {Object.summary.billing} Billing summary container element
* @param {Object.summary.product} Product summary container element
* @param {Object.summary.shipping} Shipping summary container element
*/
function initCheckoutEvent(obj){
	obj.checkout.addEventListener('click', function(){
		var billing = createBilling();
		var shipping = createShippingInfo();
		if(billing && shipping.success){
			setBillingSummary(obj.summary.billing);
			setProductSummary(obj.summary.product);
			setShippingSummary(obj.summary.shipping);
			obj.container.style.display = 'block';
		} else if(!billing){
			alert('Please check the selected products or quantity');
		} else{
			alert('Please fill the ' + shipping.field + ' field');
		}
	});

	obj.cancel.addEventListener('click', function(){
		obj.container.style.display = 'none';
	});
}