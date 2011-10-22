Divvy.Buckets = {};

Divvy.Buckets.init = function()
{
	this.win = Ti.UI.createWindow({
		title: 'Buckets',
		barColor: '#333',
		translucent: false
	});

	this.addButton = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.ADD
	});
	
	this.addDialog = Ti.UI.createOptionDialog({
		options: ['Join Existing Bucket', 'Create a Bucket', 'Cancel'],
		cancel: 2
	});
	
	this.addDialog.addEventListener('click', function(e){
		if (e.index == 0)
			Divvy.Join.open();
		else if (e.index == 1)
			Divvy.Create.open();
	});
	
	this.addButton.addEventListener('click', function(e){
		Divvy.Buckets.addDialog.show();
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
	this.tableview.appendRow(this.generateRow('Steven Lu bucket', 1, 'http://placehold.it/100x100'));
	this.tableview.appendRow(this.generateRow('Burst Dev Bucket', 2, 'http://lh4.ggpht.com/-d9CkOpNkGrE/TOS0XPbrf9I/AAAAAAAAADo/NQshQqW5Kkc/Thumbnail-100x100.png'));						
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
	
	row.add(Ti.UI.createImageView({
		width: '50', height: '50',
		top: 0, left: 0,
		image: image,
		hires: true
	}));
	
	row.add(Ti.UI.createLabel({
		text: name,
		height: 20,
		width: '230',
		top: 15, bottom: 15, left: 60,
		font: { fontFamily: 'Helvetica Neue', fontWeight: 'bold', fontSize: 18 }
	}));
	
	return row;
};