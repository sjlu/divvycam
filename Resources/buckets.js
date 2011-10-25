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
	
	this.addButton.addEventListener('click', function(e){
		Divvy.Buckets.addDialog.show();
	});
	
	this.addDialog = Ti.UI.createOptionDialog({
		options: ['Join Existing Bucket', 'Create New Bucket', 'Cancel'],
		cancel: 2
	});
	
	this.addDialog.addEventListener('click', function(e){
		if (e.index == 0)
			Divvy.Join.open();
		else if (e.index == 1)
			Divvy.Create.open();
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
		this.tableview.appendRow(
			this.generateRow(buckets[i].name, buckets[i].id)
		);
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
	
	var imageView = Ti.UI.createImageView({
		width: '50', height: '50',
		top: 0, left: 0,
		defaultImage: "images/default_thumb.png",
		hires: true
	});
	
	row.add(imageView);
	
	Network.cache.run(
		Divvy.url + 'thumbnails/'+id+'/1/desc',
		Network.CACHE_INVALIDATE, //1 week
		Divvy.Buckets.onImageUrlSuccess,
		Divvy.Buckets.onImageUrlError,
		imageView
	);	
	
	row.add(Ti.UI.createLabel({
		text: name,
		height: 20,
		width: '230',
		top: 15, bottom: 15, left: 60,
		font: { fontWeight: 'bold', fontSize: 18 }
	}));
	
	return row;
};

Divvy.Buckets.onImageUrlSuccess = function(data, date, status, user, xhr)
{
	try
	{
		data = JSON.parse(data)
	}
	catch (excp)
	{
		Divvy.Buckets.onImageUrlError(Network.PARSE_ERROR, 0);
		return;
	}
	
	if(thumbnails[0].url != null && thumbnails[0].url != "")
	{
		Network.cache.run(
			data.thumbnails[0].url,
			168, //1 week
			Divvy.Buckets.onImageCacheSuccess,
			Divvy.Buckets.onImageCacheError,
			user // this is imageview
		);
	}
	else
	{
		user.image = "images/default_thumb.png";	
	}
};

Divvy.Buckets.onImageUrlError = function(status, httpStatus)
{
	//do nothing
};

Divvy.Buckets.onImageCacheSuccess = function(data, date, status, user, xhr)
{
	user.image = data;
};

Divvy.Buckets.onImageCacheError = function(status, httpStatus)
{
	//do nothing
};