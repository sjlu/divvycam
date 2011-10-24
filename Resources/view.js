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
	
	this.cameraDialog = Ti.UI.createOptionDialog({
		options: ['Take Photo', 'Choose Existing', 'Cancel'],
		cancel: 2
	});
	
	this.cameraButton.addEventListener('click', function(e){
		Divvy.View.cameraDialog.show();
	});
	
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
	
	this.scrollView = this.createScrollView();
	
	this.win.add(this.scrollView);
	
	this.uploadIndicator = Ti.UI.createProgressBar({
			//TODO: well, do the above, the uploadIndicator
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
	
	scrollView.addEventListener('touchstart',function(e)
	{
		e.source.opacity = 0.9;
	});
	
	scrollView.addEventListener('touchend',function(e)
	{
		e.source.opacity = 1.0;
		Divvy.Preview.open(e.source.imageNumber,Divvy.View.numOfImages,e.source.imageId);
	});

	return scrollView;
};

Divvy.View.open = function(name, id)
{
	this.win.title = name;
	this.win.id = id;
	
	this.refresh();
	Divvy.open(this.win);
};

Divvy.View.close = function()
{
	this.win.remove(this.scrollView);
	delete this.scrollView;
	this.scrollView = this.createScrollView();
	this.win.add(this.scrollView);
};

Divvy.View.refresh = function()
{
	this.numOfImages = 0;
	Network.cache.run (
		Divvy.url + 'thumbnails.php?bucket_id='+Divvy.View.win.id,
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
	
	var thumbnails = data.thumbnails;
	var i = 0;
	for (var j in thumbnails)
	{
		Divvy.View.scrollView.add(Divvy.View.generateImageThumbnail(i, thumbnails[j].id, thumbnails[j].url));
		i++;
	}
};

Divvy.View.onRefreshError = function(status, httpStatus)
{
	alert("Couldn't get bucket information. ("+status+")");
};

Divvy.View.savePhoto = function(e) 
{
	var image = e.media;
	
	Network.cache.asyncPost(
		Divvy.url + 'upload.php',
		{ image: image, bucket_id: Divvy.View.win.id },
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
};

Divvy.View.onSendError = function (status, httpStatus)
{
	alert('Image upload failed, please try again. ('+status+')');
};

Divvy.View.onSendStream  = function(progress)
{
	Divvy.View.uploadProgress.value = progress;
};

Divvy.View.generateImageThumbnail = function(num,id,image)
{
	this.numOfImages++;
	var x = num % 4;
	var y = Math.floor(num / 4);
	
	var padding = 4;
	var dimension = 75;
	
	var thumbnail = Ti.UI.createImageView({
		width: dimension, height: dimension,
		top: ((dimension+padding)*y)+padding, left: ((dimension+padding)*x)+padding,
		//TODO: set default image
		hires: true,
		borderWidth: 1,
		borderColor: '#ccc',
		imageNumber: num + 1,
		imageFile: image,
		imageId: id,
		backgroundColor: '#000000',
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