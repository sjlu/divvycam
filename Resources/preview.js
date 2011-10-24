Divvy.Preview = {};

Divvy.Preview.init = function ()
{
	this.win = Ti.UI.createWindow({
		barColor: Divvy.winBarColor,
		backButtonTitle: 'Thumbnails'
	});
	
	this.win.addEventListener('close', function(e) {
		Divvy.Preview.close();
	});
/*	
	this.toolbar = Ti.UI.createToolbar({
		
	});
	
	this.win.add(this.toolbar);
*/	
	this.photo = Ti.UI.createImageView();
	
	this.win.add(this.photo);
};

Divvy.Preview.open = function (currentNum, totalNum, imageId)
{
	this.win.title = currentNum + ' of ' + totalNum;
	
	Network.cache.run(
		Divvy.url + 'image/'+imageId,
		Network.CACHE_INVALIDATE, //1 week
		Divvy.Preview.onImageUrlSuccess,
		Divvy.Preview.onImageUrlError,
		Divvy.Preview.photo
	);	

	Divvy.open(this.win);
};

Divvy.Preview.close = function()
{
	this.photo.image = null;
};

Divvy.Preview.onImageUrlSuccess = function(data, date, status, user, xhr)
{
	try
	{
		data = JSON.parse(data);
	}
	catch (excp)
	{
		Divvy.Preview.onImageUrlError(Network.PARSE_ERROR, 0);
		return;
	}
	
	if (data.status == 'error')
	{
		Divvy.Preview.onImageUrlError(data.error, 0);
		return;
	}

	Network.cache.run(
		data.url,
		168, //1 week
		Divvy.Preview.onImageSuccess,
		Divvy.Preview.onImageError,
		user
	);	
};

Divvy.Preview.onImageUrlError = function(status, httpStatus)
{
	// do nothing
};

Divvy.Preview.onImageSuccess = function(data, date, status, user, xhr)
{
	user.image = data;
};

Divvy.Preview.onImageError = function(status, httpStatus)
{
	//do nothing
};
