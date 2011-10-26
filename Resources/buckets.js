Divvy.Buckets = {};

Divvy.Buckets.init = function()
{
	/*
	 * Window/Toolbar Objects
	 */
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

	/*
	 * Views and more.
	 */

	this.tableview = Ti.UI.createTableView();
	this.tableview.addEventListener('click', function(e) {
		Divvy.View.open(e.row.bucketName, e.row.bucketId, e.row.bucketPw);
	});
	
	this.win.add(this.tableview);
};

/*
 * Open the view by invoking this function.
 */
Divvy.Buckets.open = function()
{
	this.refresh();
};

/*
 * Render the content to the view by
 * invoking this function.
 */
Divvy.Buckets.refresh = function()
{
	this.tableview.setData([]);
	var buckets = Ti.App.Properties.getList('buckets');
	
	if (buckets == null)
		return;
	
	for (var i = 0; i < buckets.length; i++)
	{
		this.tableview.appendRow(
			this.generateRow(buckets[i].name, buckets[i].id, buckets[i].pw)
		);
	}
};

/*
 * this.refresh helper
 * 
 * this function will dynamically generate a single row
 * for placement into the tableview
 */
Divvy.Buckets.generateRow = function(name, id, pw)
{
	var row = Ti.UI.createTableViewRow({
		className: 'bucketRow',
		height: 'auto', 
		hasChild: true,
		bucketName: name,
		bucketId: id,
		bucketPw: pw
	});
	
	var imageView = Ti.UI.createImageView({
		width: '50', height: '50',
		top: 0, left: 0,
		image: "/images/default_thumb.png", // render the default image first.
		defaultImage: "/images/default_thumb.png",
		hires: true
	});
	
	row.add(imageView);
	
	row.add(Ti.UI.createLabel({
		text: name,
		height: 20,
		width: '230',
		top: 15, bottom: 15, left: 60,
		font: { fontWeight: 'bold', fontSize: 18 }
	}));
	
	/*
	 * This will find the bucket's thumbnail URL from
	 * the server. IMPORTANT: THIS IS THE URL ONLY
	 * 
	 * So, the function takes in a URL
	 * the cache expiration parameter
	 * the function invoke when successful
	 * the function invoke when something went wrong
	 * and any object you like, in this case, the imageview
	 */
	Network.cache.run(
		Divvy.url + 'thumbnails/'+id+'/1/desc',
		Network.CACHE_INVALIDATE, //1 week
		Divvy.Buckets.onImageUrlSuccess,
		Divvy.Buckets.onImageUrlError,
		imageView
	);	
	
	return row;
};

/*
 * When the server returns us a URL, we take it accordingly
 * and we pass the URL into another network function, where
 * the network function will place it into our cache for us.
 * 
 * @input: resulting data, the timestamp of the data, network status (if its from the cache or not)
 * 			the user passed object into the function, and the actual XHR object itself.
 */
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

	Network.cache.run(
		data.thumbnails[0].url,
		168, //1 week
		Divvy.Buckets.onImageCacheSuccess,
		Divvy.Buckets.onImageCacheError,
		user // this is imageview
	);
};

/*
 * when we cannot get a URL from the server
 * we do nothing, and just let the default image stay.
 */
Divvy.Buckets.onImageUrlError = function(status, httpStatus)
{
	//do nothing
};

/*
 * When we get the IMAGE DATA itself, we want to give it to our
 * imageView, which was invoked through the network function itself.
 */
Divvy.Buckets.onImageCacheSuccess = function(data, date, status, user, xhr)
{
	user.image = data;
};

/*
 * If we couldn't get the image, we do nothing, that way
 * we keep the default image on the tableview.
 */
Divvy.Buckets.onImageCacheError = function(status, httpStatus)
{
	//do nothing
};

/*
 * join.js and create.js will call this function
 * when they have a successful response.
 * 
 * Purpose: This will store teh bucket information
 * into the phone's memory, meaning we don't have
 * to constantly pull from the server about the
 * bucket information.
 * 
 * @input: name, id
 * @output: void
 */
Divvy.Buckets.addBucket = function(name, id, pw)
{
	//TODO: make sure the bucket doesn't exist first
	
	var currBuckets = Ti.App.Properties.getList('buckets');
	if (currBuckets == null)
		currBuckets = [];
		
	currBuckets.push({name: name, id: id, pw: pw});
	Ti.App.Properties.setList('buckets', currBuckets);
	Divvy.Buckets.refresh();
};