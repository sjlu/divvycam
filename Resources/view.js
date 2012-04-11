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
		backgroundColor: 'white'
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
	
	this.cameraDialog.addEventListener('click', function(e)
	{
		var saveToGallery = Ti.App.Properties.getBool('save_device');
		
		if (e.index == 0)
		{
			Ti.Media.showCamera({
				success: Divvy.View.savePhoto,
				error: function(e) { if (e.code == Ti.Media.NO_CAMERA) alert("No camera detected!"); },
				allowEditing: false,
				mediaTypes: [Ti.Media.MEDIA_TYPE_PHOTO],
				saveToPhotoGallery: (saveToGallery) ? saveToGallery : false
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
	
	this.needsRedraw = 0;
	
	/*
	 * View elements
	 */
	this.activityIndicator = Ti.UI.createView({
		height: 75,
		width: 75,
		backgroundColor: '#000',
		borderRadius: 10,
		opacity: 0.75,
		zIndex: 4,
	});
	
	var indicator = Ti.UI.createActivityIndicator({
		style: Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
//		message: '\nLoading...',
		color: '#fff',
		height: 30,
		width: 30
	});
	
	indicator.show();
	
	this.activityIndicator.add(indicator);
	
	// The top element that displays the bucket id and bucket url
	this.infoView = Ti.UI.createView({
		//backgroundGradient: {
      //	type: 'linear',
      //   colors: [{ color: '#eeeeee', position: 0.0 }, { color: '#cccccc', position: 1.0}]
     	//},
     	backgroundImage: (Ti.Platform.osname == 'ipad') ? 'images/background-ipad.jpg' : 'images/background.jpg',
     	top: -270,
     	height: 320
	});

/*
	this.headerAd = Ti.Admob.createView({
    	top: 320,
    	width: (Ti.Platform.osname == 'ipad') ? '468' : '320',
    	height: (Ti.Platform.osname == 'ipad') ? '60' : '50',
    	publisherId: 'a14ebeb4bf48fdc', // You can get your own at http: //www.admob.com/
    	adBackgroundColor: 'black',
    	testing: false,
    	keywords: 'photos'
	});
*/
	
	this.infoLabel = Ti.UI.createLabel({
		text: 'Bucket ID:',
		shadowColor:'#fff',
		height: 50,
		top: 270,
		left: 60,
		width: 300,
    	shadowOffset:{x:0,y:1},
    	font:{fontSize: 14, fontWeight: 'bold'}
	});
	
	this.infoLabel.addEventListener('singletap', function(e)
	{
		Ti.Platform.openURL("https://divvy.burst-dev.com/b/"+Divvy.View.win.id);
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
		top: 271, left: 5,
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
		
		Divvy.View.emailDialog.subject = "Divvycam Bucket Invitation - "+Divvy.View.win.title;
		Divvy.View.emailDialog.messageBody = '<div style="display: block; padding: 10px; width: 280px !important;"><a href="divvycam://join?bucketId='+Divvy.View.win.id+'&bucketPw='+Ti.Network.encodeURIComponent(Divvy.View.win.pw)+'" style="display: block;color: #FFFFFF;font: bold 16px/20px Helvetica, arial, sans-serif;width: 280px;height: 25px;text-align: center;padding: 15px 0px 10px 0px;text-decoration: none;border-radius: 5px;-webkit-border-radius: 5px;-moz-border-radius: 5px;-webkit-box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);-moz-box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);background: #006600;">Join Bucket</a><h5 style="font: normal 10px/10px Helvetica, Arial, sans-serif; color: #333333; margin: 5px; text-align: center;">(View this email on your iOS device.)</h5></div>';
		Divvy.View.emailDialog.messageBody += "<br />Click the above button or type in the info manually.<br /><br />https://divvy.burst-dev.com/b/"+Divvy.View.win.id+"<br /><br />"+Divvy.View.win.title+"<br />Bucket ID: "+Divvy.View.win.id+"<br />Password: "+Divvy.View.win.pw+"<br /><br />Divvycam is an app where you can take photos with your friends and store it all in one place. It's like sharing the same memory card, but without the hassles.<br /><br />For more information visit:<br />https://divvy.burst-dev.com/";
		Divvy.View.emailDialog.setHtml(true);
		Divvy.View.emailDialog.open();
	});
	
	this.infoView.add(this.messageButton);
	
	// the element that shows the number of photos at the bottom
	this.footerView = Ti.UI.createView({
		height: 60
	});
	
	this.footerLabel = Ti.UI.createLabel({
		color: '#999',
		top: 0, height: 25,
		width: 320,
		textAlign: 'center',
		font: { fontSize: 20, fontWeight: 'bold' }
	});
	
	this.footerView.add(this.footerLabel);
	
	this.refreshLabel = Ti.UI.createLabel({
		text: 'Double Tap to Refresh',
		color: '#999',
		top: 20, height: 24,
		width: 320,
		textAlign: 'center',
		font: { fontSize: 16 }
	});
	
	this.footerView.addEventListener('doubletap', function(e)
	{
		Divvy.View.refresh();
	});
	
	this.footerView.add(this.refreshLabel);
	
/*	
	this.footerAd = Ti.Admob.createView({
    	bottom: 0,
    	width: (Ti.Platform.osname == 'ipad') ? '468' : '320',
    	height: (Ti.Platform.osname == 'ipad') ? '60' : '50',
    	publisherId: 'a14ebeb4bf48fdc', // You can get your own at http: //www.admob.com/
    	adBackgroundColor: 'black',
    	testing: false,
    	keywords: 'photos'
	});
*/
	
	this.scrollView = this.createScrollView();
	this.scrollView.hide();
	this.scrollPosition = {x: 0, y: 0};
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
	
	this.ads_top_offset = 0;
};

/*
Divvy.View.addAds = function()
{
	this.footerView.height = (Ti.Platform.osname == 'ipad') ? 120 : 110;
	this.footerView.add(this.footerAd);
	this.ads_top_offset = 50;
	
	this.infoView.add(Divvy.View.headerAd);
	this.infoView.height += Divvy.View.headerAd.height;	
};

Divvy.View.removeAds = function()
{
	this.footerView.height = 60;
	this.footerView.remove(this.footerAd);
	this.ads_top_offset = 0;
	
	this.infoView.remove(Divvy.View.headerAd);
	this.infoView.height = 320;
};
*/

Divvy.View.open = function(name, id, pw)
{
	this.win.title = name;
	this.win.id = id;
	this.win.pw = pw;
	
	this.infoLabel.text = "Bucket ID: " + id + "\nURL: divvy.burst-dev.com/b/"+id;

	Divvy.open(this.win);
	this.refresh();
};

Divvy.View.close = function()
{
	this.win.id = null;
	this.win.pw = null;
	this.win.md5 = null;
	
	this.scrollPosition = {x: 0, y: 0};
	this.win.remove(this.scrollView);
};

/*
 * Redraw completely rewrites elements.
 */
Divvy.View.redraw = function()
{
	Divvy.View.needsRedraw = 0;
	Divvy.View.win.md5 = null;
	Divvy.View.refresh();
};

/*
 * Refresh is non-obtrusive -- well, should be at least.
 */
Divvy.View.refresh = function()
{
	Divvy.View.win.add(Divvy.View.activityIndicator);

	Network.cache.run (
		Divvy.url + 'thumbnails/'+Divvy.UUID+'/'+Divvy.View.win.id+"/-1/asc",
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
	
	scrollView.addEventListener('scroll', function(e)
	{
		Divvy.View.scrollPosition.x = e.x;
		Divvy.View.scrollPosition.y = e.y;
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
	
	Divvy.View.scrollView.touchEnabled = false;
	
	var thumbnails = data.thumbnails;
	
	var needsRefresh = false;
	if (Divvy.View.imageArray != null && Divvy.View.imageArray != undefined && Divvy.View.win.md5 != data.md5)
	{
		var i = 0;
		for (var j in thumbnails)
		{
			if (Divvy.View.imageArray[i] === undefined || Divvy.View.imageArray[i].imageId != thumbnails[i].id)
			{
				needsRefresh = true;
				break;
			}
			i++;
		}
	}
	
	if (needsRefresh || Divvy.View.win.md5 == null || Divvy.View.imageArray.length > thumbnails.length)
	{	
		Divvy.View.scrollView.hide();
		Divvy.View.footerView.hide();
		
		Divvy.View.footerLabel.text = ""; // reseting footer view
	
		var scrollView = Divvy.View.createScrollView();
		scrollView.scrollTo(Divvy.View.scrollPosition.x, Divvy.View.scrollPosition.y);
		scrollView.touchEnabled = false;
		
		Divvy.View.win.md5 = data.md5;
		
		var imageArray = [];
		Divvy.View.numOfImages = 0;
		
		var i = 0;
		for (var j in thumbnails)
		{
			var newThumbnail = Divvy.View.generateImageThumbnail(i, thumbnails[j].id, thumbnails[j].url);
			imageArray.push(newThumbnail);
			scrollView.add(newThumbnail);
			i++;
		}
		
		Divvy.View.imageArray = null;
		
		Divvy.View.imageArray = imageArray;
		scrollView.add(imageArray);
		
		if ((thumbnails.length) > 16)
		{
			Divvy.View.footerView.top = (Math.ceil(thumbnails.length/4)*(Divvy.View.dimension+Divvy.View.padding))+60+Divvy.View.ads_top_offset;
			Divvy.View.footerLabel.text = thumbnails.length+" Photos";
		}
		else
		{
			Divvy.View.footerView.top = 5*(Divvy.View.dimension+Divvy.View.padding)-35+Divvy.View.ads_top_offset;
		}
		
		Divvy.View.footerView.show();
		
		Divvy.View.win.remove(Divvy.View.scrollView);
		Divvy.View.scrollView = null;
		
		Divvy.View.scrollView = scrollView;
		Divvy.View.win.add(scrollView);
		
		Divvy.View.startThumbnailQueue();
	}
	else
	{
		Divvy.View.win.remove(Divvy.View.activityIndicator);
		Divvy.View.scrollView.touchEnabled = true;
	}
	
//	if (Divvy.developmentMode)
//		Divvy.testflight.passCheckpoint("opened a bucket");
};

Divvy.View.onRefreshError = function(status, httpStatus)
{
	Divvy.View.win.remove(Divvy.View.activityIndicator);
	Divvy.View.scrollView.touchEnabled = true;
	alert("Couldn't get bucket information. ("+status+")");
};

Divvy.View.generateImageThumbnail = function(num,id,image)
{
	this.numOfImages++;
	var x = num % 4;
	var y = Math.floor(num / 4);
	
	var top_offset = 50+Divvy.View.ads_top_offset;

	var thumbnail = Ti.UI.createImageView({
		width: this.dimension, height: this.dimension,
		top: ((this.dimension+this.padding)*y)+this.padding+top_offset, left: ((this.dimension+this.padding)*x)+this.padding,
		hires: true,
		borderWidth: 1,
		borderColor: '#ccc',
		imageUrl: image,
		imageNumber: num + 1,
		imageId: id,
		backgroundColor: 'black',
		image: "/images/default_thumb.png",
	});
	
	return thumbnail;
};

Divvy.View.startThumbnailQueue = function()
{
	Divvy.View.numberOfThumbnailsRequested = (Divvy.View.imageArray.length > 20) ? 20 : Divvy.View.imageArray.length;
	
	var i = 0;
	for (i = 0; i < Divvy.View.numberOfThumbnailsRequested; i++)
	{
		
		Network.cache.run(
			Divvy.View.imageArray[i].imageUrl,
			168, //1 week
			Divvy.View.onThumbnailQueueSuccess,
			Divvy.View.onThumbnailQueueError,
			Divvy.View.imageArray[i]
		);
		
	}
	
	Divvy.View.win.remove(Divvy.View.activityIndicator);
	Divvy.View.scrollView.touchEnabled = true;
};

Divvy.View.onThumbnailQueueSuccess = function(data, date, status, user, xhr)
{
	user.image = data;
	
	if (Divvy.View.numberOfThumbnailsRequested >= Divvy.View.imageArray.length)
	{
		return;
	}
	
	Divvy.View.numberOfThumbnailsRequested++;
	Network.cache.run(
		Divvy.View.imageArray[Divvy.View.numberOfThumbnailsRequested-1].imageUrl,
		168, //1 week
		Divvy.View.onThumbnailQueueSuccess,
		Divvy.View.onThumbnailQueueError,
		Divvy.View.imageArray[Divvy.View.numberOfThumbnailsRequested-1]
	);
};

Divvy.View.onThumbnailQueueError = function(status, httpStatus)
{
	if (Divvy.View.numberOfThumbnailsRequested >= Divvy.View.imageArray.length)
	{
		Divvy.View.win.remove(Divvy.View.activityIndicator);
		Divvy.View.scrollView.touchEnabled = true;
	}
	// do nothing
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
	// 1632x1224 about 300KB avg.
	
	var targetHeight = 960;
	var targetWidth = 720;
	
	if (Divvy.Upgrade.check())
	{
		targetHeight = 1632;
		targetWidth = 1224;
	}
	
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
		{ duid: Divvy.UUID, image: image, bucket_id: Divvy.View.win.id },
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
		{ duid: Divvy.UUID, image: image, bucket_id: Divvy.View.win.id },
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
	
//	if (Divvy.developmentMode)
//		Divvy.testflight.passCheckpoint("uploaded a photo");
};

Divvy.View.onSendError = function (status, httpStatus)
{
	alert('Image upload failed, please try again. ('+status+')');
	Divvy.View.win.setToolbar(null, {animated: true});
	Divvy.View.numberOfPhotosUploaded = 0;
	Divvy.View.photosInUploadQueue = 0;
	Divvy.View.uploadQueue = [];
	Divvy.View.uploading = 0;
	
//	if (Divvy.developmentMode)
//		Divvy.testflight.passCheckpoint("upload photo error ("+status+")");
};

Divvy.View.onSendStream = function(progress)
{
	Divvy.View.uploadIndicator.value = progress;
};