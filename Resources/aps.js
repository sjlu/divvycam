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
	Network.cache.asyncPost(
		Divvy.url + 'aps',
		{ duid: Divvy.UUID, push_key: e.deviceToken },
		Divvy.APS.onSuccess,
		Divvy.APS.onError
	);
};

Divvy.APS.onSuccess = function(data, date, status, user, xhr)
{
	try
	{
		data = JSON.parse(data);
	}
	catch (excp)
	{
		Divvy.APS.onError(Network.PARSE_ERROR, 0);
		return;
	}
	
	if (data.status == 'error')
	{
		Divvy.APS.onError(data.error, 0);
		return;
	}
};

Divvy.APS.onError = function(status, httpStatus)
{
	alert('Had an issue registering to the notification service. ('+status+')');
};

Divvy.APS.error = function(e)
{
	Ti.API.info("Local device push notifications error: " + e.error);
};

Divvy.APS.receive = function(e)
{
	if (e['data'] == undefined || e['data']['aps'] == undefined)
		return;
	
	Ti.UI.iPhone.appBadge = 0;
	
	if (Divvy.View.win.id != null)
		Divvy.View.refresh();
	
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