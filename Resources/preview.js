Divvy.Preview = {};

Divvy.Preview.init = function ()
{
	this.win = Ti.UI.createWindow({
		barColor: Divvy.winBarColor,
		backButtonTitle: 'Thumbnails', // Changes the back button title, because the bucket name is too long.
		orientationModes: [ // clearly defines the orientations that this window can be at.
			Titanium.UI.PORTRAIT,
    		Titanium.UI.LANDSCAPE_LEFT,
    		Titanium.UI.LANDSCAPE_RIGHT,
		],
		translucent: true, // this makes the navBar, opaque and allows us to use the space behind the navBar.
		fullscreen: true, // allows us to use height of 480 instead of 460
		navBarHidden: true // hides the bar when it first opens.
	});
	
	Titanium.Gesture.addEventListener('orientationchange', function(e)
	{		
	    if (e.orientation == Titanium.UI.PORTRAIT)
	    {
	    	Divvy.Preview.scrollView.width = Divvy.deviceWidth;
	    	Divvy.Preview.scrollView.height = Divvy.deviceHeight;

	    }
	    else if (e.orientation == Titanium.UI.LANDSCAPE_LEFT || e.orientation == Titanium.UI.LANDSCAPE_RIGHT)
	    {
	    	Divvy.Preview.scrollView.height = Divvy.deviceWidth;
	    	Divvy.Preview.scrollView.width = Divvy.deviceHeight;
	    }
	});

	// when the window "closes", we run our "deconstruction" methods to save memory.
	this.win.addEventListener('close', function(e) {
		Divvy.Preview.close();
	});

	// pop-over dialog
	this.optionsDialog = Ti.UI.createOptionDialog({
		options: ['Save To Gallery', 'Copy To Bucket', 'Cancel'],
		cancel: 2
	});

	// when something is clicked in the dialog
	this.optionsDialog.addEventListener('click', function(e)
	{		
		// method to saving the curretn photo
		if (e.index == 0)
		{
			Ti.Media.saveToPhotoGallery(Divvy.Preview.currentView.photo.toImage(), 
			{
				success: function(e)
				{
					alert("Saved to your photo gallery!");
				},
				error: function(e)
				{
					alert("Couldn't save to your photo gallery.");
				}
			});
		}
		else if (e.index == 1)
		{
			var bucketNameArray = [];
			
			for (var i = 0; i < Divvy.Buckets.bucketsArray.length; i++)
				bucketNameArray.push(Divvy.Buckets.bucketsArray[i].bucketName);
				
			bucketNameArray.push("Cancel");
			
			var bucketDialog = Ti.UI.createOptionDialog({
				title: 'Copy this photo this which bucket?',
				options: bucketNameArray,
				cancel: bucketNameArray.length-1
			});
			
			bucketDialog.addEventListener('click', function(e)
			{
				if (e.index == Divvy.Buckets.bucketsArray.length)
					return;
				
				Network.cache.asyncPost(
					Divvy.url + 'delete/photo',
					{ 
						duid: Ti.Platform.id, 
						bucket_id: Divvy.Buckets.bucketsArray[e.index].bucketId, 
						photo_id: Divvy.View.imageArray[Divvy.Preview.currentView.index].imageId 
					},
					Divvy.Preview.onCopySuccess,
					Divvy.Preview.onCopyError
				)
			});
			
			bucketDialog.show();
			// perform copy functions here.
		}
		else if (e.index == 2 && Divvy.Preview.optionsDialog.cancel != 2)
		{
			Network.cache.asyncPost(
				Divvy.url + 'delete/photo',
				{ duid: Ti.Platform.id, id: Divvy.View.imageArray[Divvy.Preview.currentView.index].imageId },
				Divvy.Preview.onDeleteSuccess,
				Divvy.Preview.onDeleteError,
				{ current_index: Divvy.Preview.currentView.index, count: Divvy.View.imageArray.length-1 }
			);
		}
	});

	// the folder looking icon on the top right
	this.saveButton = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.ORGANIZE
	});
	
	// open the dialog view if the folder looking icon button is clicked
	this.saveButton.addEventListener('click', function(e){
		Divvy.Preview.optionsDialog.show();
	});
	
	// this just adds the button window navBar.
	this.win.rightNavButton = this.saveButton;
	
	// this is essentially a coverflow view.
	this.scrollView = Ti.UI.createScrollableView({
//		top: -20,
		views: [],
		backgroundColor: '#000',
		height: this.deviceHeight, width: this.deviceWidth,
//		contentWidth: Divvy.Preview.contentWidth, contentHeight: Divvy.Preview.contentHeight,
		showPagingControl: false, // this hides the little dots
		maxZoomScale: 1, // this just allows us to pinch and zoom
		minZoomScale: 1,
		isZoomed: false,
		isFullScreen: true, // this is not an element to the function itself, but a variable we'll use (just our own data).
	});
	
	this.currentView = null; // we want to keep track what is being viewed at the moment.

	// if the view is "tapped", hide/show the navigation bar and status bar.
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
		
		Divvy.Preview.scrollView.isFullScreen = !Divvy.Preview.scrollView.isFullScreen; // we call upon our custom var here.
	});
	
	// if we change "pages", identified as a scroll action,
	// we want to dynamically load the next images.
	this.scrollView.addEventListener('scroll', function(e) 
	{
		if (e.view == null || e.view == undefined)
			return;
		
		// this causes the current viewset to stay the same
		// if we didn't actually move to another page.
		if (e.view.index == Divvy.Preview.currentView.index)
			return;
			
		Divvy.Preview.currentView.hide(); // since we moved on, this fixes the "flashing" image bug
			
		Divvy.Preview.loadViews(e.view.index, Divvy.View.imageArray); //borrowed from other pages.
	});

	this.activityIndicator = Ti.UI.createActivityIndicator({
		width: 50, height: 50,
	});
	
	this.activityIndicator.show();
	
	this.win.add(this.scrollView);
};

Divvy.Preview.open = function (index)
{
	this.loadViews(index, Divvy.View.imageArray); //borrowed from other pages.

	Divvy.open(this.win);
	setTimeout(function(e) {
		if (Divvy.Preview.scrollView.isFullScreen)
		{
			Ti.UI.iPhone.showStatusBar({animated: false});
			Divvy.Preview.win.showNavBar({animated: false});
		}
	}, 2000);
	
	if (Divvy.developmentMode)
		Divvy.testflight.passCheckpoint("viewed a photo");
};

Divvy.Preview.close = function()
{
	Divvy.Preview.win.hideNavBar({animated: false});
	Divvy.Preview.scrollView.isFullScreen = true;
	Divvy.Preview.scrollView.views = [];
	Divvy.Preview.scrollView.height = Divvy.deviceHeight;
	Divvy.Preview.scrollView.width = Divvy.deviceWidth;
};

Divvy.Preview.loadViews = function(index, dataset)
{
	this.win.title = (index+1) + ' of ' + dataset.length;
	this.saveButton.enabled = false;
	
	var loadedViews = [];
	var selectedPage = 0;
	var i = 0;
	
	if (index > 0)
	{
		i = index - 1;
		var v1 = Ti.UI.createView({index: i});
		var a1 = Ti.UI.createActivityIndicator({width: 50, height: 50});
		a1.show();
		v1.add(a1);
		loadedViews.push(v1);
		selectedPage = 1;
	}
	
	i = index;
	var v2 = Ti.UI.createScrollView({index: i, minZoomScale: 1.0, maxZoomScale: 3.0, zoomScale: 1.0});
	v2.addEventListener('doubletap', function(e)
	{
		if (Divvy.Preview.currentView.zoomScale > 1.0)
			Divvy.Preview.currentView.zoomScale = 1.0;
		else
			Divvy.Preview.currentView.zoomScale = 2.0;
	});
	
	this.addImageToView(v2, dataset[i].imageId);
	loadedViews.push(v2);
	
	if (index < dataset.length - 1)
	{
		i = index + 1;
		var v3 = Ti.UI.createView({index: i});
		var a3 = Ti.UI.createActivityIndicator({width: 50, height: 50});
		a3.show();
		v3.add(a3);
		loadedViews.push(v3);
	}
	else
	{
		selectedPage = 1;	
	}
	

	Divvy.Preview.scrollView.currentPage = selectedPage; // we set the selected page index
	Divvy.Preview.scrollView.views = loadedViews; // we put the new viewset into the scrollView

	this.currentView = v2;
};

Divvy.Preview.addImageToView = function(view, imageId)
{
	var imageView = Ti.UI.createImageView({
		backgroundColor: '#000',
	});
	
	Network.cache.run(
		Divvy.url + 'image/'+Ti.Platform.id+'/'+imageId,
		Network.CACHE_INVALIDATE,
		Divvy.Preview.onImageUrlSuccess,
		Divvy.Preview.onImageUrlError,
		{imageView: imageView, viewContainer: view}
	);
	
	view.photo = imageView;
	view.add(imageView);
	view.add(Divvy.Preview.activityIndicator);
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
	
	if (data.permissions == '1')
	{
		Divvy.Preview.optionsDialog.options = ['Save To Gallery', 'Copy To Bucket', 'Delete Photo', 'Cancel'];
		Divvy.Preview.optionsDialog.cancel = '3';
		Divvy.Preview.optionsDialog.destructive = '2';
	}
	else
	{
		Divvy.Preview.optionsDialog.options = ['Save To Gallery', 'Copy To Bucket', 'Cancel'];
		Divvy.Preview.optionsDialog.cancel = '2';
		Divvy.Preview.optionsDialog.destructive = '-1';
	}
};

Divvy.Preview.onImageUrlError = function(status, httpStatus)
{
	// do nothing
};

Divvy.Preview.onImageSuccess = function(data, date, status, user, xhr)
{
	Divvy.Preview.saveButton.enabled = true;
	user.viewContainer.remove(Divvy.Preview.activityIndicator);
	user.imageView.image = data;
};

Divvy.Preview.onImageError = function(status, httpStatus)
{
	//do nothing
};

Divvy.Preview.onDeleteSuccess = function(data, date, status, user, xhr)
{
	try
	{
		data = JSON.parse(data);
	}
	catch (excp)
	{
		Divvy.Preview.onDeleteError(Network.PARSE_ERROR, 0);
		return;
	}
	
	if (data.status == "error")
	{
		Divvy.Preview.onDeleteError(data.error, 0);
		return;
	}
			
	Divvy.Preview.currentView.hide(); // since we moved on, this fixes the "flashing" image bug
	
	if (user.current_index+1 == user.count)
		user.current_index--;
	
	Divvy.Preview.loadViews(user.current_index, Divvy.View.imageArray);
	// perform delete functions here.
};

Divvy.Preview.onDeleteError = function(status, httpStatus)
{
	alert("Couldn't delete your photo. ("+status+")");
};

Divvy.Preview.onCopySuccess = function(data, date, status, user, xhr)
{
	try
	{
		data = JSON.parse(data);
	}
	catch (excp)
	{
		Divvy.Preview.onCopyError(Network.PARSE_ERROR, 0);
		return;
	}
	
	if (data.status == "error")
	{
		Divvy.Preview.onCopyError(data.error, 0);
		return;
	}
	
	alert("Copied photo bucket successfully.");
};

Divvy.Preview.onCopyError = function(status, httpStatus)
{
	alert("Couldn't copy the photo. ("+status+")");
};
