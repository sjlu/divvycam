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
		modal:true,
		orientationModes: [
			Titanium.UI.PORTRAIT 
		],
		backgroundColor: '#d6d8de'
	});
	
	//Create the Button
	this.doneButtonBar = Ti.UI.createButtonBar({
		labels: ['Done'],
		systemButton: Ti.UI.iPhone.SystemButtonStyle.DONE,
		backgroundColor: '5383e4'
	});
	
	this.doneButtonBar.addEventListener('click', function(e)
	{
		Divvy.Settings.done();
	});
	
	this.win.rightNavButton = this.doneButtonBar;
	
	//Start the TableView
	this.tableview = Ti.UI.createTableView({
		style: Ti.UI.iPhone.TableViewStyle.GROUPED,
	});
	
	//Table view will have sections
	this.general = Ti.UI.createTableViewSection();
	this.general.headerTitle = "General";
	
	//Create a row in first section
	this.row_name = Ti.UI.createTableViewRow({
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});
			//Customize the row
	this.label_name = Ti.UI.createLabel({
		text: 'Name',
		left: 10,
		font: { fontSize: 16, fontWeight: 'bold' }
	});
	
	this.textarea_name = Ti.UI.createTextField({
		hintText: 'Optional',
		left: 100,
		width: (Ti.Platform.osname == "ipad") ? '570' : '190', height: 24,
		editable: true,
		color: '#385487',
		keyboardType: Ti.UI.KEYBOARD,
		clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	});
	
	//Add the row
	this.row_name.add(this.textarea_name);
	this.row_name.add(this.label_name);

	//Create row in first section
	this.row_push = Ti.UI.createTableViewRow({
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});
			
	//Customize the row
	this.label_push = Ti.UI.createLabel({
		text: 'Push Notifications',
		left: 10,
		font: { fontSize: 16, fontWeight: 'bold' }
	});
			
	this.switch_push = Ti.UI.createSwitch({
		value: false,
		left: 210
	});
	
	//Make the object clickable
	this.switch_push.addEventListener('switch', function(e){
		Ti.API.info('Basic Switch value = ' + e.value + ' act val ' + basicSwitch.value);
	});
	
	//Add the row
	this.row_push.add(this.switch_push);
	this.row_push.add(this.label_push);
						
	//Create row in first section
	this.row_save = Ti.UI.createTableViewRow({
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});
	
	//Customize row
	this.label_save = Ti.UI.createLabel({
		text: 'Local Device Save',
		left: 10,
		font: { fontSize: 16, fontWeight: 'bold' }
	});
			
	this.switch_save = Ti.UI.createSwitch({
		value: false,
		left: 210
	});
	
	//Make object clickable
	this.switch_save.addEventListener('switch', function(e){
		Ti.API.info('Basic Switch value = ' + e.value + ' act val ' + basicSwitch.value);
	});
			
	//Add the row
	this.row_save.add(this.switch_save);
	this.row_save.add(this.label_save);

	//this.general.add(this.row_name);
	this.general.add(this.row_push);
	this.general.add(this.row_save);
	this.tableview.add(this.general);
	
	//Create another section in table view	
	this.pro = Ti.UI.createTableViewSection();
	this.pro.headerTitle = "Upgrade";
	
	//Create a row in second section	
	this.row_pro = Ti.UI.createTableViewRow({
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
		height: 80
	});
	
	this.image_pro = Ti.UI.createImageView({
		image: 'images/appicon.png',
		hires: true,
		height: 57,
		width: 57,
		top: 10,
		left: 10
	});
	
	this.row_pro.add(this.image_pro);
		
	//Customize that row	
	this.label_pro = Ti.UI.createLabel({
		text: 'DivvyCam Pro',
		height: 18,
		top: 20,
		left: 80,
		font: { fontSize: 16, fontWeight: 'bold' }
	});
	
	this.label_price = Ti.UI.createLabel({
		text: '$0.00',
		height: 17,
		top: 38,
		left: 80,
		font:{fontSize: 14}
	});
	
	this.button_buy = Ti.UI.createButton({
		title: 'Purchase',
		top: 25,
		left: 210,
		height: 30,
		width: 75,
	});
	
	this.row_pro.add(this.button_buy);
	this.row_pro.add(this.label_price);
	this.row_pro.add(this.label_pro);
			
	//Create row for second section
	this.row_info = Ti.UI.createTableViewRow({
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
		height: 80
	});	
		
	//Customize that row	
	this.label_info = Ti.UI.createLabel({
		text: 'Description',
		height: 'auto',
		top: 10,
		left: 10,
		font: { fontSize: 14, fontWeight: 'bold' }
	});
			
	this.label_description = Ti.UI.createLabel({
		text: 'Enables you to have unlimited buckets, better photo quality and no advertisements.',
		height: 'auto',
		top: 10,
		left: 100,
		font: { fontSize: 14 }
	});
			
	this.row_info.add(this.label_info);
	this.row_info.add(this.label_description);
			
	//Add to the second section	
	this.pro.add(this.row_pro);
	this.pro.add(this.row_info);
	this.tableview.add(this.pro);
	
	//Add the sections to the tableview
	tableData = [this.general,this.pro];
	this.tableview.setData(tableData);
	this.win.add(this.tableview);
		
}
Divvy.Settings.open = function()
{
	this.win.open();
};

Divvy.Settings.done = function()
{
	this.win.close();
};