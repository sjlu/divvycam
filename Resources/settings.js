Divvy.Settings = {};

Divvy.Settings.init = function()
{
	/*
	 * Window elements
	 */
	this.win = Ti.UI.createWindow({
	title: 'Settings',
	barColor: Divvy.winBarColor,
	barImage: Divvy.winBarImage,
	orientationModes: [
		Titanium.UI.PORTRAIT 
	],
	backgroundColor: '#d6d8de'
	});
	
	this.tableview = Ti.UI.createTableView({
	style: Ti.UI.iPhone.TableViewStyle.GROUPED,
	});
	
	this.general = Ti.UI.createTableViewSection();
	this.general.headerTitle = "General";
	
		this.row_name = Ti.UI.createTableViewRow({
			selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
		});
			
			this.label_name = Ti.UI.createLabel({
			text: 'Name',
			left: 10,
			font: { fontSize: 16, fontWeight: 'bold' }
			});
			this.row_name.add(this.label_name);

		this.row_push = Ti.UI.createTableViewRow({
			selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
		});
		
			this.label_push = Ti.UI.createLabel({
			text: 'Push Notifications',
			left: 10,
			font: { fontSize: 16, fontWeight: 'bold' }
			});
			this.row_push.add(this.label_push);
			
		this.row_save = Ti.UI.createTableViewRow({
			selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
		});
		
			this.label_save = Ti.UI.createLabel({
			text: 'LocalDevice Save',
			left: 10,
			font: { fontSize: 16, fontWeight: 'bold' }
			});
			this.row_save.add(this.label_save);

	this.general.add(this.row_name);
	this.general.add(this.row_push);
	this.general.add(this.row_save);
	this.tableview.add(this.general);
		
	this.pro = Ti.UI.createTableViewSection();
	this.pro.headerTitle = "Upgrade";
			
		this.row_pro = Ti.UI.createTableViewRow({
			selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
		});
		
			this.label_pro = Ti.UI.createLabel({
			text: 'Upgrade to Pro',
			left: 10,
			font: { fontSize: 16, fontWeight: 'bold' }
			});
			this.row_pro.add(this.label_pro);
			
	//this.tableview.appendRow(this.row_pro);
	this.pro.add(this.row_pro);
	this.tableview.add(this.pro);
	
	tableData = [this.general,this.pro];
	this.tableview.setData(tableData);
	this.win.add(this.tableview);
		
}
Divvy.Settings.open = function()
{
	Divvy.open(this.win);
};
