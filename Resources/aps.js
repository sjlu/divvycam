Divvy.APS = {};

if (Divvy.developmentMode)
{
	Divvy.APS.KEY = '7GWmo_cbQai_9rDsYVdvdQ';
	Divvy.APS.SECRET = 'GTc8hkkVSBiMY9kdrOMFWg';
}
else
{
	Divvy.APS.KEY = 'KpBAW5_2SWSfFlQXZvDudQ';
	Divvy.APS.SECRET = '7cxONCxcRC-rrnuCqr39Cg';
}


Divvy.APS.open = function()
{
	Titanium.Network.registerForPushNotifications({
		types: [
			Titanium.Network.NOTIFICATION_TYPE_BADGE,
			Titanium.Network.NOTIFICATION_TYPE_ALERT,
			Titanium.Network.NOTIFICATION_TYPE_SOUND
		],
		
		success: Divvy.APS.success,
		error: Divvy.APS.error,
		callback: Divvy.APS.receive
	});
};

Divvy.APS.success = function(e)
{
	var request = Titanium.Network.createHTTPClient({
		onload:function(e) 
		{
			if (request.status != 200 && request.status != 201) 
			{
				request.onerror(e);
				return;
			}
		},
		
		onerror:function(e) {
			Ti.API.info("Register with Urban Airship Push Service failed. Error: " + e.error);
		}
   });

	// Register device token with UA
	request.open('PUT', 'https://go.urbanairship.com/api/device_tokens/' + e.deviceToken, true);
	request.setRequestHeader('Authorization','Basic ' + Titanium.Utils.base64encode(Divvy.APS.KEY + ':' + Divvy.APS.SECRET));
	request.send();
};

Divvy.APS.error = function(e)
{
	Ti.API.info("Error during registration: " + e.error);
};

Divvy.APS.receive = function(e)
{
	if (e['data'] == undefined || e['data']['aps'] == undefined)
	{
		return;
	}
	
	Ti.UI.iPhone.appBadge = 0;
	
	// For now, Titanium has no way of differentiating between outside-aps event handlers
	// and inside-aps event handlers. So at this current moment, nothing can be done.
	// please watch CB ticket #55 for more information
	
	//alert(e);
	
	/*
	Divvy.Messages.Chat.win.title = e['data']['aps']['name'];
   Divvy.Messages.currentChat = e['data']['aps']['fbid'];
	Divvy.Messages.Chat.win.close();
   Divvy.Messages.Chat.drawInit();
	Divvy.Tabs.tabGroup.setActiveTab(1);
   Divvy.Tabs.messagesTab.open(Divvy.Messages.Chat.win, {animated: true});
	Divvy.Messages.Chat.tableview.scrollToIndex(Divvy.Messages.Chat.table_data.length-1, {animated: false});
	*/
};