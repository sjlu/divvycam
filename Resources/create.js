Divvy.Create = {};

Divvy.Create.init = function()
{
	this.win = Ti.UI.createWindow({
		title: 'New Bucket',
		barColor: Divvy.winBarColor,
		barImage: Divvy.winBarImage,
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
		width: 190, height: 24,
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
		hintText: 'Required',
		left: 100,
		width: 190, height: 24,
		editable: true,
		passwordMask: true,
		color: '#385487',
      autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	});
	
	this.row_bucketpw.add(this.textarea_bucketpw);
	this.row_bucketpw.add(this.label_bucketpw);
	
	this.tableview = Ti.UI.createTableView({
		style: Ti.UI.iPhone.TableViewStyle.GROUPED,
	});
	
	this.tableview.appendRow(this.row_bucketname);
	this.tableview.appendRow(this.row_bucketpw);
	this.win.add(this.tableview);
	
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
		Divvy.url + 'create.php',
		{ duid: Ti.Platform.id, name: this.textarea_bucketname.value, password: this.textarea_bucketpw.value },
		Divvy.Create.onSuccess,
		Divvy.Create.onError
	);
};

Divvy.Create.onError = function(status, httpStatus)
{
	alert("We couldn't create your bucket, please try again. ("+status+")");
	this.hideLoading();
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
	
	Divvy.Buckets.addBucket(data.bucket_name, data.bucket_id);
	Divvy.Create.hideLoading();
	Divvy.Create.win.close();
	Divvy.Create.reset();
};

Divvy.Create.reset = function()
{
	this.textarea_bucketname.value = "";
	this.textarea_bucketpw.value = "";
};