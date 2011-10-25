Divvy.View = {};

Divvy.View.init = function()
{
	this.win = Ti.UI.createWindow({
		barColor: Divvy.winBarColor,
		barImage: Divvy.winBarImage,
	});
	
	this.win.addEventListener('close', function(e){
		Divvy.View.close();
	});
	
	this.cameraButton = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.CAMERA,
		backgroundColor: '#00BFFF'
	});
	
	this.cameraButton.addEventListener('click', function(e){
		Divvy.View.cameraDialog.show();
	});
	
	this.cameraDialog = Ti.UI.createOptionDialog({
		options: ['Take Photo', 'Choose Existing', 'Cancel'],
		cancel: 2
	});
	
	this.activityIndicator = Ti.UI.createActivityIndicator({
		style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK
	});
	this.activityIndicator.show();
	
	this.cameraDialog.addEventListener('click', function(e){
		if (e.index == 0)
		{
			Ti.Media.showCamera({
				success: Divvy.View.savePhoto,
				allowEditing: false,
				mediaTypes: [Ti.Media.MEDIA_TYPE_PHOTO]
			});
		}
		else if (e.index == 1)
		{
			Ti.Media.openPhotoGallery({
				success: Divvy.View.savePhoto,
				allowEditing: false,
				mediaTyles: [Ti.Media.MEDIA_TYPE_PHOTO]
			});
		}
	});
	
	this.win.rightNavButton = this.cameraButton;
	
	this.infoView = Ti.UI.createView({
		backgroundGradient: {
      	type: 'linear',
         colors: [{ color: '#eeeeee', position: 0.0 }, { color: '#cccccc', position: 1.0}]
     	},
     	top: -200,
     	height: 250
	});
	
	this.infoLabel = Ti.UI.createLabel({
		text: 'Bucket ID:',
		shadowColor:'#fff',
		top: 200,
		left: 20,
		width: 300,
    	shadowOffset:{x:0,y:1},
    	font:{fontSize: 14}
	});
	
	this.infoView.add(this.infoLabel);
	
	this.footerView = Ti.UI.createView({
		height: 50
	});
	this.footerLabel = Ti.UI.createLabel({
		color: '#999',
		width: 320,
		textAlign: 'center',
		font: {fontSize: 20}
	});
	this.footerView.add(this.footerLabel);
	
	this.scrollView = this.createScrollView();
	this.win.add(this.scrollView);
	
	this.uploadIndicator = Ti.UI.createProgressBar({
		width: 250,
		min: 0,
		max: 1,
		value: 0,
		color: '#fff',
		message: 'Uploading Photo',
		font: {fontSize: 14, fontWeight: 'bold'},
		style: Ti.UI.iPhone.ProgressBarStyle.PLAIN,
	});
	
	this.uploadIndicator.show();
	
	this.flexSpace = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
};

Divvy.View.createScrollView = function()
{
	var scrollView = Ti.UI.createScrollView({
		contentWidth: 320,
		contentHeight: 'auto',
		top: 0,
		showVerticalScrollIndicator: true,
		backgroundColor: 'white'
	});
	
	scrollView.add(Divvy.View.infoView);
	scrollView.add(Divvy.View.footerView);
	
	scrollView.addEventListener('touchstart',function(e)
	{
		if (e.source.imageId == undefined)
			return;
		e.source.opacity = 0.7;
	});
	
	scrollView.addEventListener('touchend',function(e)
	{
		if (e.source.imageId == undefined)
			return;
			
		e.source.opacity = 1.0;
		Divvy.Preview.open(e.source.imageNumber,Divvy.View.numOfImages,e.source.imageId);
	});

	return scrollView;
};

Divvy.View.open = function(name, id)
{
	this.win.title = name;
	this.win.id = id;
	
	this.infoLabel.text = "Bucket ID: " + id + "\nURL: divvy.burst-dev.com/b/"+id;
	
	this.refresh();
	Divvy.open(this.win);
};

Divvy.View.close = function()
{
	this.win.remove(this.scrollView);
	delete this.scrollView;
	this.scrollView = this.createScrollView();
	this.win.add(this.scrollView);
	Divvy.View.footerLabel.text = "";
};

Divvy.View.refresh = function()
{
	Divvy.View.win.add(Divvy.Preview.activityIndicator);
	this.numOfImages = 0;
	Network.cache.run (
		Divvy.url + 'thumbnails/'+Divvy.View.win.id+"/-1/asc",
		Network.CACHE_INVALIDATE,
		Divvy.View.onRefreshSuccess, 
		Divvy.View.onRefreshError
	);
};

Divvy.View.onRefreshSuccess = function(data, date, status, user, xhr)
{
	try
	{
		data = JSON.parse(data);
	}
	catch (excp)
	{
		Divvy.View.onRefreshError(Network.PARSE_ERROR, 0);
		return;
	}
	
	if (data.status == 'error')
	{
		Divvy.View.onRefreshError(data.error, 0);
		return;
	}
	
	Divvy.View.win.remove(Divvy.Preview.activityIndicator);
		
	var thumbnails = data.thumbnails;
	Divvy.View.footerView.top = (Math.ceil(thumbnails.length/4)*79)+50;
	Divvy.View.footerLabel.text = thumbnails.length+" Photos"
	var i = 0;
	for (var j in thumbnails)
	{
		Divvy.View.scrollView.add(Divvy.View.generateImageThumbnail(i, thumbnails[j].id, thumbnails[j].url));
		i++;
	}
};

Divvy.View.onRefreshError = function(status, httpStatus)
{
	Divvy.View.win.remove(Divvy.Preview.activityIndicator);
	alert("Couldn't get bucket information. ("+status+")");
};

Divvy.View.savePhoto = function(e) 
{
	var image = e.media;
	
	/*
	 * iPhone 4S image dimensions
	 * fullres: 3264x2448 (h x w)
	 * halfres: 1632x1224 (h x w)
	 * 
	 * iPhone 4 image dimensions
	 * fullres: 1936x2592 (h x w)
	 * halfres: 968x612 (h x w)
	 */
	var targetHeight = 968;
	var targetWidth = 612;
	
	if (image.height > targetHeight || image.width > targetWidth)
	{
		if (image.height > image.width)
		{
			var newHeight = targetHeight;
			var newWidth = Math.ceil((targetHeight/image.height)*image.width);
		}
		else
		{
			var newWidth = targetWidth;
			var newHeight = Math.ceil((targetWidth/image.width)*image.height);
		}
		
		var resizedImage = Ti.UI.createImageView({
			image: image,
			width: newWidth, height: newHeight
		});
		
		image = resizedImage.toImage();
	}
	
	Divvy.View.cameraButton.enabled = false;
	Divvy.View.win.setToolbar([Divvy.View.flexSpace, Divvy.View.uploadIndicator, Divvy.View.flexSpace]);
	
	Network.cache.asyncPost(
		Divvy.url + 'upload',
		{ image:  image, bucket_id: Divvy.View.win.id },
		Divvy.View.onSendSuccess,
		Divvy.View.onSendError,
		Divvy.View.onSendStream
	);
};

Divvy.View.onSendSuccess = function(data, date, status, user, xhr)
{
	try
	{
		data = JSON.parse(data);
	}
	catch (excp)
	{
		Divvy.View.onSendError(Network.PARSE_ERROR, 0);
		return;
	}
	
	if (data.status == 'error')
		Divvy.View.onSendError(data.error, 0);
		
	Divvy.View.refresh();
	Divvy.Buckets.refresh();
	Divvy.View.win.setToolbar(null, {animated: true});
	Divvy.View.uploadIndicator.value = 0;
	Divvy.View.cameraButton.enabled = true;
};

Divvy.View.onSendError = function (status, httpStatus)
{
	alert('Image upload failed, please try again. ('+status+')');
	Divvy.View.win.setToolbar(null, {animated: true});
	Divvy.View.uploadIndicator.value = 0;
	Divvy.View.cameraButton.enabled = true;
};

Divvy.View.onSendStream = function(progress)
{
	Divvy.View.uploadIndicator.value = progress;
};

Divvy.View.generateImageThumbnail = function(num,id,image)
{
	this.numOfImages++;
	var x = num % 4;
	var y = Math.floor(num / 4);
	
	var top_offset = 50;

	var padding = 4;
	var dimension = 75;
	
	var thumbnail = Ti.UI.createImageView({
		width: dimension, height: dimension,
		top: ((dimension+padding)*y)+padding+top_offset, left: ((dimension+padding)*x)+padding,
		//TODO: set default image
		hires: true,
		borderWidth: 1,
		borderColor: '#ccc',
		imageNumber: num + 1,
		imageFile: image,
		imageId: id,
		backgroundColor: '#000000',
		image: "/images/default_thumb.png",
		defaultImage: "/images/default_thumb.png",
	});
	
	Network.cache.run(
		image,
		168, //1 week
		Divvy.View.onImageCacheSuccess,
		Divvy.View.onImageCacheError,
		thumbnail
	);
	
	return thumbnail;
};

Divvy.View.onImageCacheSuccess = function(data, date, status, user, xhr)
{
	user.image = data;
};

Divvy.View.onImageCacheError = function(status, httpStatus)
{
	//do nothing
};