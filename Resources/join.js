Divvy.Join = {};

Divvy.Join.init = function()
{
	/*
	 * Window elements
	 */
	this.win = Ti.UI.createWindow({
		title: 'Join A Bucket',
		barColor: Divvy.winBarColor,
		barImage: Divvy.winBarImage,
		orientationModes: [
			Titanium.UI.PORTRAIT
		],
		backgroundColor: '#d6d8de'
	});
	
	this.navButtonBar = Ti.UI.createButtonBar({
		labels: ['Join'],
		style: Ti.UI.iPhone.SystemButtonStyle.DONE,
		backgroundColor: '5383e4'
	});

	this.navButtonBar.addEventListener('click', function(e) {
		Divvy.Join.onSubmit();
	});

	this.win.rightNavButton = this.navButtonBar;
	
	/*
	 * View elements
	 */
	this.tableview = Ti.UI.createTableView({
		style: Ti.UI.iPhone.TableViewStyle.GROUPED,
	});
	
	this.footerView = Ti.UI.createView({height: 60});
	this.footerLabel = Ti.UI.createLabel({
		text: "Type in the 6 digit bucket ID and the password that was provided in order to join an existing bucket.",
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
	
	this.row_bucketid = Ti.UI.createTableViewRow({
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});
	
	this.label_bucketid = Ti.UI.createLabel({
		text: 'Bucket',
		left: 10,
		font: { fontSize: 16, fontWeight: 'bold' }
	});
	
	this.textarea_bucketid = Ti.UI.createTextField({
		hintText: '6 Digit ID',
		left: 100,
		width: (Ti.Platform.osname == "ipad") ? '570' : '190', height: 24,
		editable: true,
		color: '#385487',
		keyboardType: Ti.UI.KEYBOARD_NUMBER_PAD,
		clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	});
	
	this.row_bucketid.add(this.textarea_bucketid);
	this.row_bucketid.add(this.label_bucketid);
	
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
		width: (Ti.Platform.osname == "ipad") ? '570' : '190', height: 24,
		editable: true,
		passwordMask: true,
		color: '#385487',
      autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	});
	
	this.row_bucketpw.add(this.textarea_bucketpw);
	this.row_bucketpw.add(this.label_bucketpw);
	
	this.tableview.appendRow(this.row_bucketid);
	this.tableview.appendRow(this.row_bucketpw);
	this.win.add(this.tableview);
	
	/*
	 * All other elements that are invoked
	 * at a later time.
	 */
	this.titleControlView = Ti.UI.createView({
		width: 80, height: 60,
	});
	
	this.titleControlLabel = Ti.UI.createLabel({
		text: 'Joining',
		color: '#fff',
		font: { fontWeight: 'bold', fontSize: 20 }
	});
	this.titleControlView.add(this.titleControlLabel);
	this.titleControlIndicator = Ti.UI.createActivityIndicator({left: 45});
	this.titleControlIndicator.show();
	this.titleControlView.add(this.titleControlIndicator);
};

Divvy.Join.open = function()
{
	Divvy.open(this.win);
};

Divvy.Join.reset = function()
{
	this.textarea_bucketid.value = "";
	this.textarea_bucketpw.value = "";
};

Divvy.Join.showLoading = function()
{
	var fakeButton = Ti.UI.createView();
	
	this.win.titleControl = this.titleControlView;
	this.win.leftNavButton = fakeButton;
	this.win.rightNavButton = null;
	this.textarea_bucketid.enabled = false;
	this.textarea_bucketpw.enabled = false;
};

Divvy.Join.hideLoading = function()
{
	this.win.titleControl = null;
	this.win.leftNavButton = null;
	this.win.rightNavButton = this.navButtonBar;
	this.textarea_bucketid.enabled = true;
	this.textarea_bucketpw.enabled = true;
};

Divvy.Join.onSubmit = function()
{
	if (this.textarea_bucketid.value == "")
	{
		alert("You did not provide a name for your bucket.");
		return;
	}
	else if (this.textarea_bucketid.value.length != 6)
	{
		alert("Invalid Bucket ID value.");
		return;
	}
	else if (this.textarea_bucketpw.value == "")
	{
		alert("You need to provide us a password.");	
		return;
	}
	else if (this.textarea_bucketpw.value.length < 6)
	{
		alert("Password needs to be six characters long.");
		return;
	}
	
	this.showLoading();
	
	Network.cache.asyncPost(
		Divvy.url + 'join',
		{ duid: Ti.Platform.id, bucket_id: this.textarea_bucketid.value, password: this.textarea_bucketpw.value },
		Divvy.Join.onSuccess,
		Divvy.Join.onError,
		this.textarea_bucketpw.value
	);
};

Divvy.Join.onSuccess = function(data, date, status, user, xhr)
{
	try
	{
		data = JSON.parse(data);
	}
	catch (excep)
	{
		Divvy.Join.onError(Network.PARSE_ERROR, 0);
		return;
	}

	if (data.status == 'error')
	{
		Divvy.Join.onError(data.error, 0);
		return;
	}
	
	Divvy.Buckets.addBucket(data.bucket_name, data.bucket_id, user);
	Divvy.Join.hideLoading();
	Divvy.Join.win.close();
	Divvy.Join.reset();
};

Divvy.Join.onError = function(status, httpStatus)
{
	alert("We couldn't join the bucket, please try again. ("+status+")");
	Divvy.Join.hideLoading();
};
