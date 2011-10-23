Divvy.View = {};

Divvy.View.init = function()
{
	this.win = Ti.UI.createWindow({
		barColor: Divvy.winBarColor,
		barImage: Divvy.winBarImage,
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
				allowEditing: true,
				mediaTypes: [Ti.Media.MEDIA_TYPE_PHOTO]
			});
		}
		else if (e.index == 1)
		{
			Ti.Media.openPhotoGallery({
				success: Divvy.View.savePhoto,
				allowEditing: true,
				mediaTyles: [Ti.Media.MEDIA_TYPE_PHOTO]
			});
		}
	
	});
	
	this.win.rightNavButton = this.cameraButton;
	
	this.scrollView = Ti.UI.createScrollView({
		contentWidth: 320,
		contentHeight: 'auto',
		top: 0,
		showVerticalScrollIndicator: true,
		backgroundColor: 'white'
	});
	this.scrollView.addEventListener('touchstart',function(e)
	{
		e.source.opacity = 0.9;
	});
	this.scrollView.addEventListener('touchend',function(e)
	{
		e.source.opacity = 1.0;
		Divvy.Preview.open(e.source.imageNumber,Divvy.View.numOfImages,e.source.imageFile);
	});
	
	this.win.add(this.scrollView);
	
};

Divvy.View.open = function(name, id)
{
	this.win.title = name;
	this.win.id = id;
	
	this.numOfImages = 0;
	
	for (var i = 0; i < 24; i++)
	{
		this.scrollView.add(this.generateImageThumbnail(i,'http://lh4.ggpht.com/-d9CkOpNkGrE/TOS0XPbrf9I/AAAAAAAAADo/NQshQqW5Kkc/Thumbnail-100x100.png'));
	}
	
	Divvy.open(this.win);
};


Divvy.View.savePhoto = function(e){
	alert(e);
};

Divvy.View.generateImageThumbnail = function(num,image)
{
	this.numOfImages++;
	var x = num % 4;
	var y = Math.floor(num / 4);
	
	var padding = 4;
	var dimension = 75;
	
	var thumbnail = Ti.UI.createImageView({
		width: dimension, height: dimension,
		top: ((dimension+padding)*y)+padding, left: ((dimension+padding)*x)+padding,
		image: image,
		hires: true,
		borderWidth: 1,
		borderColor: '#ccc',
		imageNumber: num + 1,
		imageFile: image,
		backgroundColor: '#000000',
	});
	
	return thumbnail;
};
