Divvy.Preview = {};

Divvy.Preview.init = function ()
{
	this.win = Ti.UI.createWindow({
		barColor: Divvy.winBarColor,
		backButtonTitle: 'Thumbnails',
		orientationModes: [
			Titanium.UI.PORTRAIT,
    		Titanium.UI.LANDSCAPE_LEFT,
    		Titanium.UI.LANDSCAPE_RIGHT,
		],
		translucent: true,
		fullscreen: true,
		navBarHidden: true
	});

	this.win.addEventListener('close', function(e) {
		Divvy.Preview.close();
	});

	this.scrollView = Ti.UI.createScrollView({
//		top: -20,
		maxZoomScale: 3.0,
		isFullScreen: false,
		scaled: false,
	});


	this.scrollView.addEventListener('singletap', function(e) {
		if (Divvy.Preview.scrollView.isFullScreen) {
			Ti.UI.iPhone.showStatusBar({animated: false});
//			Divvy.Preview.scrollView.animate({top: -20});
			Divvy.Preview.win.showNavBar({animated: false});
		} else {
			Ti.UI.iPhone.hideStatusBar({animated: false});
//			Divvy.Preview.scrollView.animate({top: 0});
			Divvy.Preview.win.hideNavBar({animated: false});

		}
		
		Divvy.Preview.scrollView.isFullScreen = !Divvy.Preview.scrollView.isFullScreen;
	});
/*
	this.scrollView.addEventListener('doubletap', function(e) {  
		clearInterval(Divvy.Preview.scrollAnimation);
		
		if (Divvy.Preview.scrollView.scaled)
		{
			Divvy.Preview.scrollAnimation = setInterval(function() {
				if (Divvy.Preview.scrollView.zoomScale >= 2.0)
					clearInterval(Divvy.Preview.scrollAnimation);
				Divvy.Preview.scrollView.zoomScale += 0.1;
			}, 20);
		}
		else
		{
			Divvy.Preview.scrollAnimation = setInterval(function() {
				if (Divvy.Preview.scrollView.zoomScale <= 1.0)
					clearInterval(Divvy.Preview.scrollAnimation);
				Divvy.Preview.scrollView.zoomScale -= 0.1;
			}, 20);
		}
		
    	Divvy.Preview.scrollView.scaled = !Divvy.Preview.scrollView.scaled;
	});
/*	
	this.toolbar = Ti.UI.createToolbar({
		
	});
	
	this.win.add(this.toolbar);
*/	
	this.photo = Ti.UI.createImageView({
		backgroundColor: '#000',
		top: 0,
	});
	
	
	this.scrollView.add(this.photo);
	this.win.add(this.scrollView);
	
	this.activityIndicator = Ti.UI.createActivityIndicator();
	this.activityIndicator.show();
};

Divvy.Preview.open = function (currentNum, totalNum, imageId)
{
	this.win.title = currentNum + ' of ' + totalNum;
	
	this.win.add(this.activityIndicator);
	
	Network.cache.run(
		Divvy.url + 'image/'+imageId,
		Network.CACHE_INVALIDATE, //1 week
		Divvy.Preview.onImageUrlSuccess,
		Divvy.Preview.onImageUrlError,
		Divvy.Preview.photo
	);	

	Divvy.open(this.win);
	setTimeout(function(e) {
		if (Divvy.Preview.scrollView.isFullScreen)
		{
			Ti.UI.iPhone.showStatusBar({animated: false});
			Divvy.Preview.win.showNavBar({animated: false});
		}
	}, 1000);
};

Divvy.Preview.close = function()
{
	this.photo.image = null;
	Divvy.Preview.win.hideNavBar({animated: false});
	Divvy.Preview.scrollView.isFullScreen = true;
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
	Divvy.Preview.win.remove(Divvy.Preview.activityIndicator);
};

Divvy.Preview.onImageSuccess = function(data, date, status, user, xhr)
{
	user.image = data;
	Divvy.Preview.scrollView.add(Divvy.Preview.photo);
	Divvy.Preview.win.remove(Divvy.Preview.activityIndicator);
};

Divvy.Preview.onImageError = function(status, httpStatus)
{
	//do nothing
	Divvy.Preview.win.remove(Divvy.Preview.activityIndicator);
};
