// ui.js
exports.createStoreKitView = function(products)
{
	var storekit = require('ti.storekit');
	var wrapper = Ti.UI.createView();
	var inPurchase = false;
	
	// window container
	var indWin = Ti.UI.createWindow({
		height:120,
		width:150
	});

	// black view
	var indView = Ti.UI.createView({
		height:120,
		width:150,
		backgroundColor:'#000',
		borderRadius:10,
		opacity:0.8
	});
	indWin.add(indView);

	// loading indicator
	var actInd = Ti.UI.createActivityIndicator({
		style:Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
		height:30,
		width:30,
		top:40
	});
	indWin.add(actInd);

	// message
	var message = Ti.UI.createLabel({
		text:'Purchasing',
		color:'#fff',
		width:'auto',
		height:'auto',
		font:{fontSize:20,fontWeight:'bold'},
		bottom:15
	});
	indWin.add(message);

	var tableView = Ti.UI.createTableView({minRowHeight:70});
	var data = [];
	for (var c=0;c<products.length;c++)
	{
		var row = Ti.UI.createTableViewRow({selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.NONE});
		(function()
		{
			var product = products[c];
			
			var titleLabel = Ti.UI.createLabel({
				text:products[c].title,
				left:10,
				top:10,
				width:"auto",
				height:"auto",
				textAlign:"left",
				font:{fontSize:15,fontWeight:"bold"}
			});
			var descriptionLabel = Ti.UI.createLabel({
				text:products[c].description,
				left:10,
				top:35,
				width:"auto",
				height:"auto",
				textAlign:"left",
				font:{fontSize:14,fontWeight:"normal"}
			});
			var priceButton = Ti.UI.createView({
				backgroundColor:"#009",
				width:55,
				borderRadius:8,
				height:22,
				right:10,
				zIndex:10,
				button:true
			});
			var buyButton = Ti.UI.createView({
				backgroundColor:"#070",
				width:55,
				borderRadius:8,
				height:22,
				right:10,
				zIndex:1,
				button:true
			});
			var priceLabel = Ti.UI.createLabel({
				width:"auto",
				height:"auto",
				text:products[c].formattedPrice,
				textAlign:"center",
				font:{fontSize:13,fontWeight:"bold"},
				color:"white",
				button:true
			});
			var buyLabel = Ti.UI.createLabel({
				width:"auto",
				height:"auto",
				text:"BUY NOW",
				textAlign:"center",
				font:{fontSize:13,fontWeight:"bold"},
				color:"white",
				button:true
			});
			priceButton.addEventListener('click',function()
			{
				if (inPurchase) return;
				priceButton.visible=false;
				priceButton.animate({opacity:0},function()
				{
					priceButton.visible=true;
				});
				buyButton.opacity = 1;
				buyButton.visible = true;
				buyButton.animate({width:80,duration:250});
			});

			buyButton.add(buyLabel);
			priceButton.add(priceLabel);
			
			function revertButton()
			{
				buyButton.visible=false;
				buyButton.animate({opacity:0},function()
				{
					buyButton.width = 55;
				});
				priceButton.opacity = 1;
			}

			row.addEventListener('click',function(e)
			{
				if (typeof(e.source.button)=='undefined' && !inPurchase)
				{
					revertButton();
				}
			});

			var purchaseInd = Ti.UI.createActivityIndicator({
				height:30,
				width:30,
				right:20,
				style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK
			});

			row.add(titleLabel);
			row.add(descriptionLabel);
			row.add(buyButton);
			row.add(priceButton);
			row.add(purchaseInd);
			
			function completePurchase()
			{
				buyButton.visible = true;
				priceButton.visible = true;
				purchaseInd.hide();
				inPurchase = false;
				revertButton();
				indWin.close();
				actInd.hide();
			}
			
			function purchaseCallback(e)
			{
				switch(e.state)
				{
					case storekit.PURCHASED:
					{
						completePurchase();
						break;
					}
					case storekit.FAILED:
					{
						completePurchase();
						if (!e.cancelled)
						{
							alert("Error making purchase. "+e.message);
						}
						break;
					}
				}
			};
			
			buyButton.addEventListener('click',function()
			{
				buyButton.visible = false;
				priceButton.visible = false;
				purchaseInd.show();
				inPurchase = true;
				indWin.open();
				actInd.show();
				storekit.purchase(product,purchaseCallback,1);
			});
		})();
		data[c] = row;
	}
	tableView.data = data;
	wrapper.add(tableView);
	return wrapper;
};
