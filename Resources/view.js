Divvy.View = {};

Divvy.View.init = function()
{
	/*
	 * Window elements
	 */
	this.win = Ti.UI.createWindow({
		barColor: Divvy.winBarColor,
		barImage: Divvy.winBarImage,
		orientationModes: [
			Titanium.UI.PORTRAIT
		],
	});
	
	this.padding = 4;
	this.dimension = 75;
	
	if (Ti.Platform.osname == 'ipad')
	{
		this.padding = 13;
		this.dimension = 175;
	}
	
	this.win.addEventListener('close', function(e)
	{
		Divvy.View.close();
	});
	
	// this is a bug fix if the other 
	// view was in a different orientation
	this.win.addEventListener('focus', function(e) 
	{
		Divvy.View.win.hideNavBar({animated: false});
		Divvy.View.win.showNavBar({animated: false});
	});
	
	this.cameraButton = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.CAMERA,
		backgroundColor: '#00BFFF'
	});
	
	this.cameraButton.addEventListener('click', function(e){
		Divvy.View.cameraDialog.show();
	});
	
	this.win.rightNavButton = this.cameraButton;
	
	this.cameraDialog = Ti.UI.createOptionDialog({
		options: ['Take Photo', 'Choose Existing', 'Cancel'],
		cancel: 2
	});
	
	this.cameraDialog.addEventListener('click', function(e){
		if (e.index == 0)
		{
			Ti.Media.showCamera({
				success: Divvy.View.savePhoto,
				error: function(e) { if (e.code == Ti.Media.NO_CAMERA) alert("No camera detected!"); },
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
	
	/*
	 * View elements
	 */
	this.activityIndicator = Ti.UI.createActivityIndicator({
		style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK
	});
	
	this.activityIndicator.show();
	
	// The top element that displays the bucket id and bucket url
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
		left: 60,
		width: 300,
    	shadowOffset:{x:0,y:1},
    	font:{fontSize: 14, fontWeight: 'bold'}
	});
	
	this.infoView.add(this.infoLabel);
	
	this.emailDialog = Titanium.UI.createEmailDialog({barcolor: Divvy.winBarColor});	
 	this.emailDialog.addEventListener('complete', function(e)
	{
		if (e.result == Divvy.View.emailDialog.FAILED)
			alert("Either something went wrong or there isn't any email account.");
	});	
	
	this.messageButton = Ti.UI.createButton({
		height: 49, width: 50,
		top: 202, left: 5,
		image: "images/mail.png",
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		systemButton: Ti.UI.iPhone.SystemButton.ACTION
	});
	
	this.messageButton.addEventListener('click', function(e)
	{
		if (!Divvy.View.emailDialog.isSupported())
		{
			alert("Couldn't open the email application.");
			return;
		}
		
		Divvy.View.emailDialog.subject = "You've been invited to share photos!";
		Divvy.View.emailDialog.messageBody = "https://divvy.burst-dev.com/b/"+Divvy.View.win.id+"\n\n"+Divvy.View.win.title+"\nBucket ID: "+Divvy.View.win.id+"\nPassword: "+Divvy.View.win.pw+"\n\nDivvycam is an app where you can take photos with your friends and store it all in one place. It's like sharing the same memory card, but without the hassles.\n\nFor more information visit:\nhttps://divvy.burst-dev.com/";
		Divvy.View.emailDialog.open();
	});
	
	this.infoView.add(this.messageButton);
	
	// the element that shows the number of photos at the bottom
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
	
	this.imageArray = [];
	
	/*
	 * All other elements that
	 * are invoked at a later time.
	 */
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
	
	this.uploadQueue = [];
	this.numberOfPhotosUploaded = 0;
	this.photosInUploadQueue = 0;
	this.uploading = 0;
};

Divvy.View.open = function(name, id, pw)
{
	this.win.title = name;
	this.win.id = id;
	this.win.pw = pw;
	
	this.infoLabel.text = "Bucket ID: " + id + "\nURL: divvy.burst-dev.com/b/"+id;
	
	Divvy.View.win.add(Divvy.View.activityIndicator);
	this.refresh();
	setTimeout(function(){Divvy.View.scrollView.scrollTo(0, 45)}, 50); //nice and subtle
	Divvy.open(this.win);
};

Divvy.View.close = function()
{
	this.win.id = null;
	this.win.pw = null;
	this.win.md5 = null;
	this.win.remove(this.scrollView);
	delete this.scrollView;
	this.scrollView = this.createScrollView();
	this.win.add(this.scrollView);
	Divvy.View.footerLabel.text = "";
};

Divvy.View.refresh = function()
{
	Network.cache.run (
		Divvy.url + 'thumbnails/'+Ti.Platform.id+'/'+Divvy.View.win.id+"/-1/asc",
		Network.CACHE_INVALIDATE,
		Divvy.View.onRefreshSuccess, 
		Divvy.View.onRefreshError,
		Divvy.View.win.id
	);
};

/*
 * Because we don't want to constantly leave a full view
 * in the memory, we want to constantly invoke this
 * when we call new buckets.
 */
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
		Divvy.Preview.open(e.source.imageNumber-1);
	});

	return scrollView;
};

/*
 * This is after we get all the thumbnails from the server.
 */
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
		if (data.error == 'no_such_bucket' || data.error == 'permission_denied')
		{
			Divvy.Buckets.removeBucket(user);
//			Divvy.Buckets.win.close();
		}
		
		Divvy.View.onRefreshError(data.error, 0);
		return;
	}
	
	Divvy.View.win.remove(Divvy.View.activityIndicator);
	
	if (Divvy.View.win.md5 != undefined && data.md5 != undefined && data.md5 == Divvy.View.win.md5)
		return;
		
	Divvy.View.win.md5 = data.md5;
	
	this.imageArray = [];
	this.numOfImages = 0;
		
	var thumbnails = data.thumbnails;
	
	Divvy.View.footerView.top = 5*(Divvy.View.dimension+Divvy.View.padding)+15;
	
	if ((thumbnails.length) > 16)
	{
		Divvy.View.footerView.top = (Math.ceil(thumbnails.length/4)*(Divvy.View.dimension+Divvy.View.padding))+50;
		Divvy.View.footerLabel.text = thumbnails.length+" Photos";
	}
		
	var i = 0;
	for (var j in thumbnails)
	{
		Divvy.View.imageArray[i] = Divvy.View.generateImageThumbnail(i, thumbnails[j].id, thumbnails[j].url);
		Divvy.View.scrollView.add(Divvy.View.imageArray[i]);
		i++;
	}
	
	if (Divvy.developmentMode)
		Divvy.testflight.passCheckpoint("opened a bucket");
};

Divvy.View.onRefreshError = function(status, httpStatus)
{
	Divvy.View.win.remove(Divvy.View.activityIndicator);
	alert("Couldn't get bucket information. ("+status+")");
};

Divvy.View.generateImageThumbnail = function(num,id,image)
{
	this.numOfImages++;
	var x = num % 4;
	var y = Math.floor(num / 4);
	
	var top_offset = 50;

	var thumbnail = Ti.UI.createImageView({
		width: this.dimension, height: this.dimension,
		top: ((this.dimension+this.padding)*y)+this.padding+top_offset, left: ((this.dimension+this.padding)*x)+this.padding,
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

Divvy.View.savePhoto = function(e) 
{
//	Divvy.View.cameraButton.enabled = false;

	var image = e.media;
	
	/*
	 * iPhone 4S image dimensions
	 * fullres: 3264x2448 (h x w)
	 * halfres: 1632x1224 (h x w)
	 * 1/4res: 968x612 (h x w) (500kb)
	 * 
	 * iPhone 4 image dimensions
	 * fullres: 1936x2592 (h x w)
	 * halfres: 968x612 (h x w)
	 */
	var targetHeight = 1632;
	var targetWidth = 1224;
	
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
		
		image = Divvy.jpgcompressor.scale(image, newWidth, newHeight);
	}
	
	var compImgPath, compImg;
	compImgPath = Divvy.jpgcompressor.compress(image, 'temp_image.png');
	compImg = Ti.Filesystem.getFile(compImgPath);
	image = compImg.read.blob;
	
	Divvy.View.addToUploadQueue(image, Divvy.View.win.id);
	
	/*
	Network.cache.asyncPost(
		Divvy.url + 'upload',
		{ duid: Ti.Platform.id, image: image, bucket_id: Divvy.View.win.id },
		Divvy.View.onSendSuccess,
		Divvy.View.onSendError,
		null,
		Divvy.View.onSendStream
	);
	*/
};

Divvy.View.addToUploadQueue = function(image, bucket_id)
{	
	this.uploadQueue.push({image: image, bucket_id: bucket_id});
	this.photosInUploadQueue++;
	
	Divvy.View.uploadIndicator.message = 'Uploading '+Divvy.View.numberOfPhotosUploaded+' of '+Divvy.View.photosInUploadQueue+' Photos';
	
	if (Divvy.View.uploading == 0)
		Divvy.View.uploadNextPhotoInQueue();
};

Divvy.View.uploadNextPhotoInQueue = function()
{
	var next_in_queue = this.uploadQueue.shift();
	
	if (next_in_queue == null)
		return;	

	Divvy.View.numberOfPhotosUploaded++;
	
	Divvy.View.uploadIndicator.message = 'Uploading '+Divvy.View.numberOfPhotosUploaded+' of '+Divvy.View.photosInUploadQueue+' Photos';
	Divvy.View.uploadIndicator.value = 0;
	Divvy.View.win.setToolbar([Divvy.View.flexSpace, Divvy.View.uploadIndicator, Divvy.View.flexSpace]);
	
	var image = next_in_queue.image;
	var bucket_id = next_in_queue.bucket_id;
	
	this.uploading = 1;
	Network.cache.asyncPost(
		Divvy.url + 'upload',
		{ duid: Ti.Platform.id, image: image, bucket_id: Divvy.View.win.id },
		Divvy.View.onSendSuccess,
		Divvy.View.onSendError,
		null,
		Divvy.View.onSendStream
	);
};

/*
 * This is invoked by the gallery or the camera, after when
 * they have selected a photo
 */
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
	if (Divvy.View.numberOfPhotosUploaded == Divvy.View.photosInUploadQueue)
	{
		Divvy.View.win.setToolbar(null, {animated: true});
		Divvy.View.numberOfPhotosUploaded = 0;
		Divvy.View.photosInUploadQueue = 0;
		Divvy.View.uploading = 0;
	}
	else
	{
		Divvy.View.uploadNextPhotoInQueue();
	}
	
	//Divvy.View.cameraButton.enabled = true;
	
	if (Divvy.developmentMode)
		Divvy.testflight.passCheckpoint("uploaded a photo");
};

Divvy.View.onSendError = function (status, httpStatus)
{
	alert('Image upload failed, please try again. ('+status+')');
	Divvy.View.win.setToolbar(null, {animated: true});
	Divvy.View.numberOfPhotosUploaded = 0;
	Divvy.View.photosInUploadQueue = 0;
	Divvy.View.uploadQueue = [];
	Divvy.View.uploading = 0;
	
	if (Divvy.developmentMode)
		Divvy.testflight.passCheckpoint("upload photo error ("+status+")");
};

Divvy.View.onSendStream = function(progress)
{
	Divvy.View.uploadIndicator.value = progress;
};