Divvy = {};

Divvy.tabs = Ti.UI.createTabGroup({bottom: -50});
Divvy.tab = Ti.UI.createTab();

Divvy.open = function(window)
{
	Divvy.tab.open(window, {animated: true});
};

Ti.include(
	'buckets.js',
	'view.js',
	'create.js'
);

Divvy.Buckets.init();
Divvy.View.init();
Divvy.Create.init();

Divvy.Buckets.open();
Divvy.tab.window = Divvy.Buckets.win;
Divvy.tabs.addTab(Divvy.tab);
Divvy.tabs.open();