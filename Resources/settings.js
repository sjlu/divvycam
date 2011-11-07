Divvy.Settings = {};

Divvy.Settings.init = function()
{
	/*
	 * Window elements
	 */
	this.win = Ti.UI.createWindow({
	title: 'Settings',
	barColor: Divvy.winBarColor,
	barImage: Divvy.winBarImage,
	orientationModes: [
		Titanium.UI.PORTRAIT 
	],
	backgroundColor: '#d6d8de'
	});
	
	
		
}
Divvy.Settings.open = function()
{
	Divvy.open(this.win);
};
