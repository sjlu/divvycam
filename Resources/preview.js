Divvy.Preview = {};

Divvy.Preview.init = function ()
{
	this.win = Ti.UI.createWindow({
		barColor: Divvy.winBarColor,
		barImage: Divvy.winBarImage,
		translucent: false,
		backButtonTitle: 'Thumbnails'
	});
	
	this.toolbar = Ti.UI.createToolbar({
		
	});
	
	this.win.add(this.toolbar);
	
	this.photo = Ti.UI.createImageView({
	
	});
	
	this.win.add(this.photo)

};

Divvy.Preview.open = function (currentNum, totalNum, image)
{
	this.win.title = currentNum + ' of ' + totalNum;
	this.photo.image = image;

	Divvy.open(this.win);
};


