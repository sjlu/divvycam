Divvy.Create = {};

Divvy.Create.init = function()
{
	this.win = Ti.UI.createWindow({
		title: 'New Bucket',
	});
};

Divvy.Create.open = function()
{
	Divvy.open(this.win);
};
