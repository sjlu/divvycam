Divvy.Create = {};

Divvy.Create.init = function()
{
	/*
	 * Window objects
	 */
	this.win = Ti.UI.createWindow({
		title: 'New Bucket',
		barColor: Divvy.winBarColor,
		barImage: Divvy.winBarImage,
		orientationModes: [
			Titanium.UI.PORTRAIT
		],
		backgroundColor: '#d6d8de'
	});
	
	this.win.addEventListener('close', function(e)
	{
		Divvy.Create.reset();
	});
	
	this.navButtonBar = Ti.UI.createButtonBar({
		labels: ['Create'],
		style: Ti.UI.iPhone.SystemButtonStyle.DONE,
		backgroundColor: '5383e4'
	});

	this.navButtonBar.addEventListener('click', function(e) {
		Divvy.Create.onSubmit();
	});

	this.win.rightNavButton = this.navButtonBar;
	
	/*
	 * View elements
	 */
	this.tableview = Ti.UI.createTableView({
		style: Ti.UI.iPhone.TableViewStyle.GROUPED,
	});
	

	
	this.footerView = Ti.UI.createView({height: 180});
	this.footerView.addEventListener('touchstart', function(e)
	{
		Divvy.Create.textarea_bucketname.blur();
		Divvy.Create.textarea_bucketpw.blur();
	});
	this.footerLabel = Ti.UI.createLabel({
		text: "Buckets are meant to be shared, don't use a password you currently use.\n\nBuckets are intended for temporary use and not for backup purposes, they are eventually deleted. You can always download a copy onto your device or on the web.",
		textAlign: "center", width: 280,
		color: '#4c566c',
		shadowOffset:{x:0,y:1},
		font: { fontSize: 16 }
	});
	this.footerView.add(this.footerLabel);
	this.tableview.footerView = this.footerView;
	
	this.row_bucketname = Ti.UI.createTableViewRow({
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});
	
	this.label_bucketname = Ti.UI.createLabel({
		text: 'Name',
		left: 10,
		font: { fontSize: 16, fontWeight: 'bold'}
	});
	
	this.textarea_bucketname = Ti.UI.createTextField({
		hintText: 'My New Bucket',
		left: 100,
		width: (Ti.Platform.osname == "ipad") ? '570' : '190', height: 24,
		editable: true,
		color: '#385487',
		clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	});
	
	this.row_bucketname.add(this.textarea_bucketname);
	this.row_bucketname.add(this.label_bucketname);
	
	this.row_bucketpw = Ti.UI.createTableViewRow({
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});
	
	this.label_bucketpw = Ti.UI.createLabel({
		text: 'Password',
		left: 10,
		font: { fontSize: 16, fontWeight: 'bold' }
	});
	
	this.textarea_bucketpw = Ti.UI.createTextField({
		hintText: 'Required (>6 characters)',
		left: 100,
		width: (Ti.Platform.osname == "ipad") ? '570' : '190', height: 24,
		editable: true,
		passwordMask: true,
		color: '#385487',
      	autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	});
	
	this.row_bucketpw.add(this.textarea_bucketpw);
	this.row_bucketpw.add(this.label_bucketpw);
	
	this.tableview.appendRow(this.row_bucketname);
	this.tableview.appendRow(this.row_bucketpw);
	this.win.add(this.tableview);
	
	/*
	 * All other elements
	 * Elements that don't show intially
	 * but are invoked by sections of code
	 */
	this.titleControlView = Ti.UI.createView({
		width: 100, height: 60,
	});
	
	this.titleControlLabel = Ti.UI.createLabel({
		text: 'Creating',
		color: '#fff',
		font: { fontWeight: 'bold', fontSize: 20 }
	});
	this.titleControlView.add(this.titleControlLabel);
	this.titleControlIndicator = Ti.UI.createActivityIndicator({left: 50});
	this.titleControlIndicator.show();
	this.titleControlView.add(this.titleControlIndicator);
};

Divvy.Create.open = function()
{
	Divvy.open(this.win);
};

Divvy.Create.reset = function()
{
	this.textarea_bucketname.value = "";
	this.textarea_bucketpw.value = "";
};

Divvy.Create.showLoading = function()
{
	var fakeButton = Ti.UI.createView();
	
	this.win.titleControl = this.titleControlView;
	this.win.leftNavButton = fakeButton;
	this.win.rightNavButton = null;
	this.textarea_bucketname.enabled = false;
	this.textarea_bucketpw.enabled = false;
};


Divvy.Create.hideLoading = function()
{
	this.win.titleControl = null;
	this.win.leftNavButton = null;
	this.win.rightNavButton = this.navButtonBar;
	this.textarea_bucketname.enabled = true;
	this.textarea_bucketpw.enabled = true;
};

Divvy.Create.onSubmit = function()
{	
	if (this.textarea_bucketname.value == "")
	{
		alert("You did not provide a name for your bucket.");
		return;
	}
	else if (this.textarea_bucketpw.value == "")
	{
		alert("You need to provide us a password.");	
		return;
	}
	else if (this.textarea_bucketpw.value.length < 6)
	{
		alert("Your password needs to be six characters long.");
		return;
	}
	
	this.showLoading();
	
	Network.cache.asyncPost(
		Divvy.url + 'create',
		{ duid: Ti.Platform.id, name: this.textarea_bucketname.value, password: this.textarea_bucketpw.value },
		Divvy.Create.onSuccess,
		Divvy.Create.onError,
		this.textarea_bucketpw.value
	);
};

Divvy.Create.onError = function(status, httpStatus)
{
	alert("We couldn't create your bucket, please try again. ("+status+")");
	this.hideLoading();
	
	if (Divvy.developmentMode)
		Divvy.testflight.passCheckpoint("create bucket network error ("+status+")");
};

Divvy.Create.onSuccess = function(data, date, status, user, xhr)
{		
	try
	{
		data = JSON.parse(data);
	}
	catch (excep)
	{
		Divvy.Create.onError(Network.PARSE_ERROR, 0);
		return;
	}

	if (data.status == 'error')
	{
		Divvy.Create.onError(data.error, 0);
		return;
	}
	
	Divvy.Buckets.addBucket(data.bucket_name, data.bucket_id, user);
	Divvy.Create.hideLoading();
	Divvy.Create.win.close();
	Divvy.Create.reset();
	
	if (Divvy.developmentMode)
		Divvy.testflight.passCheckpoint("created new bucket");
};