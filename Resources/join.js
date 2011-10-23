Divvy.Join = {};

Divvy.Join.init = function()
{
	this.win = Ti.UI.createWindow({
		title: 'Join A Bucket',
		barColor: Divvy.winBarColor,
		barImage: Divvy.winBarImage,
		translucent: false
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
		width: 190, height: 24,
		editable: true,
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
		width: 190, height: 24,
		editable: true,
		passwordMask: true,
      autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	});
	
	this.row_bucketpw.add(this.textarea_bucketpw);
	this.row_bucketpw.add(this.label_bucketpw);
	
	this.tableview = Ti.UI.createTableView({
		style: Ti.UI.iPhone.TableViewStyle.GROUPED,
	});
	
	this.tableview.appendRow(this.row_bucketid);
	this.tableview.appendRow(this.row_bucketpw);
	this.win.add(this.tableview);
};

Divvy.Join.open = function()
{
	Divvy.open(this.win);
};

Divvy.Join.onSubmit = function()
{
	
};
