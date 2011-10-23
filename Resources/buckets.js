Divvy.Buckets = {};

Divvy.Buckets.init = function()
{
	this.win = Ti.UI.createWindow({
		title: 'Buckets',
		barColor: Divvy.winBarColor,
		barImage: Divvy.winBarImage,
	});

	this.addButton = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.ADD
	});
	
	this.addDialog = Ti.UI.createOptionDialog({
		options: ['Join Existing Bucket', 'Create A Bucket', 'Cancel'],
		cancel: 2
	});
	
	this.addDialog.addEventListener('click', function(e){
		if (e.index == 0)
			Divvy.Join.open();
		else if (e.index == 1)
			Divvy.Create.open();
	});
	
	this.addButton.addEventListener('click', function(e){
		Divvy.Buckets.addDialog.show();
	});
	
	this.win.rightNavButton = this.addButton;

	this.tableview = Ti.UI.createTableView();
	this.tableview.addEventListener('click', function(e) {
		Divvy.View.open(e.row.bucketName, e.row.bucketId);
	});
	
	this.win.add(this.tableview);
};

Divvy.Buckets.open = function()
{
	this.refresh();
};

Divvy.Buckets.refresh = function()
{
	this.tableview.setData([]);
	var buckets = Ti.App.Properties.getList('buckets');
	
	if (buckets == null)
		return;
	
	for (var i = 0; i < buckets.length; i++)
	{
		this.tableview.appendRow(this.generateRow(buckets[i].name, buckets[i].id, 'http://lh4.ggpht.com/-d9CkOpNkGrE/TOS0XPbrf9I/AAAAAAAAADo/NQshQqW5Kkc/Thumbnail-100x100.png'));
	}
};

Divvy.Buckets.addBucket = function(name, id)
{
	//TODO: make sure the bucket doesn't exist first
	
	var currBuckets = Ti.App.Properties.getList('buckets');
	if (currBuckets == null)
		currBuckets = [];
		
	currBuckets.push({name: name, id: id});
	Ti.App.Properties.setList('buckets', currBuckets);
	Divvy.Buckets.refresh();
};

Divvy.Buckets.generateRow = function(name, id, image)
{
	var row = Ti.UI.createTableViewRow({
		className: 'bucketRow',
		height: 'auto', 
		hasChild: true,
		bucketName: name,
		bucketId: id
	});
	
	row.add(Ti.UI.createImageView({
		width: '50', height: '50',
		top: 0, left: 0,
		image: image,
		hires: true
	}));
	
	row.add(Ti.UI.createLabel({
		text: name,
		height: 20,
		width: '230',
		top: 15, bottom: 15, left: 60,
		font: { fontWeight: 'bold', fontSize: 18 }
	}));
	
	return row;
};