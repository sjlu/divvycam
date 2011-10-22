Divvy.Create = {};

Divvy.Create.init = function()
{
	this.win = Ti.UI.createWindow({
		title: 'New Bucket',
		barColor: '#333',
		translucent: false
	});
	
	this.row_bucketname = Ti.UI.createTableViewRow({
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});
	
	this.label_bucketname = Ti.UI.createLabel({
		text: 'Name',
		left: 10,
		font: { fontSize: 16, fontWeight: 'bold' }
	});
	
	this.textarea_bucketname = Ti.UI.createTextField({
		hintText: 'My New Bucket',
		left: 100,
		width: 190, height: 24,
		editable: true,
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
		hintText: 'Optional',
		left: 100,
		width: 190, height: 24,
		editable: true,
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
};

Divvy.Create.open = function()
{
	Divvy.open(this.win);
};
