Divvy.APS = {};

/*
if (Divvy.developmentMode)
{
	Divvy.APS.KEY = '7GWmo_cbQai_9rDsYVdvdQ';
	Divvy.APS.SECRET = 'GTc8hkkVSBiMY9kdrOMFWg';
}
else
{
*/
	Divvy.APS.KEY = 'KpBAW5_2SWSfFlQXZvDudQ';
	Divvy.APS.SECRET = '7cxONCxcRC-rrnuCqr39Cg';
//}


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
	
	if (Divvy.state != 'open')
	{
		Divvy.Preview.win.close();
		Divvy.View.win.close();
		
		var found_bucket = false;
		for(var i = 0; i < Divvy.Buckets.bucketsArray.length; i++)
		{
			if (Divvy.Buckets.bucketsArray[i].bucketsId == e['data']['aps']['bucket_id'])
			{
				found_bucket = i;
				break;
			}
		}
		
		if (found_bucket != false)
		{
			var bucket = Divvy.Buckets.bucketsArray[found_bucket];
			Divvy.View.open(bucket.bucketName, bucket.bucketId, bucket.bucketPw);
		}
	}
	
	if (Divvy.View.win.id != null)
	{
		Divvy.View.refresh();
	}
		
	Divvy.Buckets.refresh();
	
	// For now, Titanium has no way of differentiating between outside-aps event handlers
	// and inside-aps event handlers. So at this current moment, nothing can be done.
	// please watch CB ticket #55 for more information
};

Divvy.state = 'open';

Ti.App.addEventListener('pause', function(e)
{
	Divvy.state = 'paused';
});
 
// After app is fully resumed, recheck if launch arguments
// have changed and ignore duplicate schemes.
Ti.App.addEventListener('resumed', function(e)
{
	Divvy.state = 'restoring';
	
	setTimeout(function()
	{
		Divvy.state = 'open';
	}, 1000); // 1 second
});