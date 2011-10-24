Divvy = {};

Divvy.tabs = Ti.UI.createTabGroup({bottom: -50});
Divvy.tab = Ti.UI.createTab();

Divvy.winBarImage = 'images/navbar-background.png';
Divvy.winBarColor = '#333';

Divvy.url = 'http://divvy.burst-dev.com/api/';

Divvy.open = function(window)
{
	Divvy.tab.open(window, {animated: true});
};

Ti.include(
	'network.js',
	'buckets.js',
	'view.js',
	'create.js',
	'join.js',
	'preview.js'
);

Divvy.Buckets.init();
Divvy.View.init();
Divvy.Create.init();
Divvy.Join.init();
Divvy.Preview.init();

Divvy.Buckets.open();
Divvy.tab.window = Divvy.Buckets.win;
Divvy.tabs.addTab(Divvy.tab);
Divvy.tabs.open();