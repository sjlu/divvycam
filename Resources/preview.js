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
	
	Titanium.Gesture.addEventListener('orientationchange', function(e)
	{
	    if (e.orientation == Titanium.UI.PORTRAIT)
	    {
	    	Divvy.Preview.scrollView.height = 480;
	    	Divvy.Preview.scrollView.width = 320;
	    }
	    else if (e.orientation == Titanium.UI.LANDSCAPE_LEFT || e.orientation == Titanium.UI.LANDSCAPE_RIGHT)
	    {
	    	Divvy.Preview.scrollView.height = 320;
	    	Divvy.Preview.scrollView.width = 480;
	    }
	});

	this.win.addEventListener('close', function(e) {
		Divvy.Preview.close();
	});

	this.saveToGalleryDialog = Ti.UI.createOptionDialog({
		options: ['Save To Gallery', 'Cancel'],
		cancel: 1
	});

	this.saveToGalleryDialog.addEventListener('click', function(e)
	{
		if (e.index != 0)
			return;
			
		Ti.Media.saveToPhotoGallery(Divvy.Preview.photo.toImage(), {
			success: function(e)
			{
				alert("Saved to your photo gallery!");
			},
			error: function(e)
			{
				alert("Couldn't save to your photo gallery.");
			}
		});
	});

	this.saveButton = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.ORGANIZE
	});
	
	this.saveButton.addEventListener('click', function(e){
		Divvy.Preview.saveToGalleryDialog.show();
	});
	
	this.win.rightNavButton = this.saveButton;
	
	this.scrollView = Ti.UI.createScrollView({
//		top: -20,
		width: 320, height: 480,
		maxZoomScale: 3.0,
		isFullScreen: false,
		scaled: false,
	});


	this.scrollView.addEventListener('touchend', function(e) {
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
	
	this.activityIndicator = Ti.UI.createActivityIndicator({width: 50, height: 50});
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
	Divvy.Preview.scrollView.scrollZoom = 1.0;
	Divvy.Preview.scrollView.height = 480;
	Divvy.Preview.scrollView.width = 320;
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
