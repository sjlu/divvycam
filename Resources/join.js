Divvy.Join = {};

Divvy.Join.init = function()
{
	this.win = Ti.UI.createWindow({
		title: 'Join A Bucket',
		barColor: '#333',
		translucent: false
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
		hintText: '5-digit ID',
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
		hintText: 'Optional',
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