Divvy.Upgrade = {};

Divvy.Upgrade.init = function()
{
	Ti.Storekit.requestProducts(['pro'], function(e)
	{
		if (!e.success)
		{
			alert("Couldn't grab the Pro version info.");
			return;
		}
	});
	
	Ti.Storekit.addEventListener('restoreCompletedTransactions', function(e)
	{
		if (e.error)
			alert(error);
		else if (e.transactions == null || e.transactions.length == 0)
			alert("You didn't purchase the Pro version yet!");
		else
		{
			Divvy.Upgrade.complete();
		}	
	});
};

Divvy.Upgrade.purchase = function()
{
	var product = 'pro';
	Ti.Storekit.purchase(product, function(r)
	{
		if (r.state == Ti.Storekit.FAILED)
		{
			alert("There was an issue purchasing the Pro version.");
		}
		else if (r.state == Ti.Storekit.PURCHASED || r.state == Ti.Storekit.RESTORED)
		{
			var receipt = r.receipt;
			Ti.Storekit.verifyReceipt({
				receipt: receipt,
				sandbox: true,
				callback: function(e)
				{
					if (e.success)
					{
						if (e.valid)
						{
							Divvy.Upgrade.complete();
						}
						else
						{
							alert("Couldn't verify the transaction, please try again.");
						}
					}
					else
					{
						alert("No transaciton completed.");
					}
				},
			});
		}
	});
};

Divvy.Upgrade.check = function()
{
	if (Divvy.Upgrade.hasPro === undefined)
	{
		Divvy.Upgrade.hasPro = Ti.App.Properties.getBool('hasPro');
		
		if (Divvy.Upgrade.hasPro == null)
			Divvy.Upgrade.hasPro = false;
	}
	else
	{
		return Divvy.Upgrade.hasPro;
	}
};

Divvy.Upgrade.restore = function()
{
	Ti.Storekit.restoreCompletedTransactions();
};

Divvy.Upgrade.complete = function()
{
	Ti.App.Properties.setBool('hasPro', true);
	
	Divvy.Buckets.removeAds();
	Divvy.View.removeAds();
};
