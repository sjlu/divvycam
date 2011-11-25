Divvy = {}; // We want to intialize our program into a single function first

if (Ti.App.Properties.hasProperty('uuid'))
{
	Divvy.UUID = Ti.App.Properties.getString('uuid');
}
else
{
	Divvy.UUID = Ti.Platform.createUUID();
	Ti.App.Properties.setString('uuid', Divvy.UUID);
}

Divvy.jpgcompressor = require('com.sideshowcoder.jpgcompressor');
Divvy.jpgcompressor.setCompressSize(512000);
Divvy.jpgcompressor.setWorstCompressQuality(0.6);

Titanium.Storekit = Ti.Storekit = require('ti.storekit');
Titanium.Admob = Ti.Admob = require('ti.admob');

Divvy.developmentMode = true;

if (Divvy.developmentMode)
{
	Divvy.testflight = require('com.0x82.testflight');
	Divvy.testflight.takeOff('488eb7c844eded229570cdf2384e8137_MzgyNDcyMDExLTExLTAxIDIyOjIxOjQwLjA3NjIzNg');
}

/*
 * Any configurations to Titanium itself, and variables that need to be set
 * throughout the application. Kind of like Global Variables in a sense.
 */
Titanium.UI.iPhone.statusBarStyle = Titanium.UI.iPhone.StatusBar.TRANSLUCENT_BLACK;
Titanium.UI.orientation = Ti.UI.PORTRAIT;

if (Ti.Platform.osname == 'ipad')	
	Divvy.winBarImage = 'images/navbar-ipad.png';
else
	Divvy.winBarImage = 'images/navbar-iphone.png';
	
Divvy.winBarColor = '#333';

Divvy.deviceHeight = 480;
Divvy.deviceWidth = 320;
Divvy.device = 'iphone';

if (Ti.Platform.osname == 'ipad')
{
	Divvy.deviceHeight = 1024;
	Divvy.deviceWidth = 768;
	Divvy.device = 'ipad';
}

Divvy.url = 'https://divvy.burst-dev.com/api/';

/*
 * Take in all the other code we need.
 */
Ti.include(
	'aps.js',
	'network.js',
	'buckets.js',
	'view.js',
	'create.js',
	'join.js',
	'preview.js',
	'settings.js',
	'upgrade.js'
);

/* 
 * Now we begin rendering the UI itself.
 */
// TI Tabs is the overlord for windows.
Divvy.tabs = Ti.UI.createTabGroup({bottom: -50});
Divvy.tab = Ti.UI.createTab();

Divvy.open = function(window)
{
	Divvy.tab.open(window, {animated: true});
};

//init takes UI objects and places it in memory
Divvy.Buckets.init();
Divvy.View.init();
Divvy.Create.init();
Divvy.Join.init();
Divvy.Preview.init();
Divvy.Settings.init();
Divvy.Upgrade.init();

//TODO: Fix ads, they are really buggy.
/*
if (!Divvy.Upgrade.check())
{
	Divvy.Buckets.addAds();
	Divvy.View.addAds();
}
*/

//open actually shows our UI elements.
Divvy.Buckets.open();

if (Divvy.developmentMode)
{
	Network.cache.asyncPost(
		Divvy.url + 'join',
		{ duid: Divvy.UUID, bucket_id: '100075', password: 'yellow' },
		Divvy.Join.onSuccess,
		Divvy.Join.onError,
		'yellow'
	);
}

Divvy.tab.window = Divvy.Buckets.win; // this is our intial window, we need to pass it to the overlord
Divvy.tabs.addTab(Divvy.tab);
Divvy.tabs.open();

Divvy.APS.open();

/*
 * Adding event listeners if app is brought in and out of background
 * and refresh services, to refresh the bucket views.
 */

/*
Ti.App.addEventListener('resume', function(e)
{
	if (Divvy.View.win.id != null)
		Divvy.View.refresh();
});
*/

if (Divvy.developmentMode)
	Divvy.testflight.passCheckpoint("app opened");