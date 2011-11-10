var win = Ti.UI.createWindow({ backgroundColor: 'white' });

Titanium.Storekit = Ti.Storekit = require('ti.storekit');

var tableview = Ti.UI.createTableView({ bottom: 50 });
tableview.addEventListener('click', function(e) {
    var product = e.row.product;
    Ti.Storekit.purchase(product, function(r) {
        if (r.state == Ti.Storekit.FAILED) {
            Ti.UI.createAlertDialog({
                title: 'Error',
                message: 'Purchasing product: ' + r.message
            }).show();
        }
        else if (r.state == Ti.Storekit.PURCHASED ||
            r.state == Ti.Storekit.RESTORED) {
            var receipt = r.receipt;
            Ti.Storekit.verifyReceipt(
                {
                    receipt: receipt,
                    sandbox: true,
                    /*sharedSecret: '<<FOR SUBSCRIPTIONS, PUT YOUR SHARED SECRET FROM ITUNESCONNECT HERE>>',*/
                    callback: function(e) {
                        if (e.success) {
                            if (e.valid) {
                                Ti.UI.createAlertDialog({
                                    title: 'Success!',
                                    message: 'Receipt verified!'
                                }).show();
                            }
                            else {
                                Ti.UI.createAlertDialog({
                                    title: 'Failure?!',
                                    message: 'Receipt verification failed!'
                                }).show();
                            }
                        }
                        else {
                            Ti.UI.createAlertDialog({
                                title: 'Error',
                                message: 'Verifying receipt: ' + e.message
                            }).show();
                        }
                    }
                });
        }
        else {
            Ti.API.info('Purchasing...');
        }
    });
});

if (!Ti.Storekit.canMakePayments) {
    Ti.UI.createAlertDialog({
        title: 'Error',
        message: 'Cannot make payments to in-app purchase store'
    }).show();
}
else {
    win.add(tableview);
    Ti.Storekit.requestProducts(['<<YOUR PRODUCTS HERE>>'], function(e) {
        if (!e.success) {
            Ti.UI.createAlertDialog({
                title: 'Error',
                message: 'Getting products: ' + e.message
            }).show();
            return;
        }
        Ti.API.info('Found products: ' + e.products);
        Ti.API.info('Invalid: ' + e.invalid);
        for (var i = 0; i < e.products.length; i++) {
            tableview.appendRow({
                title: e.products[i].title,
                product: e.products[i]
            });
        }
    });

    var restoreCompletedTransactions = Ti.UI.createButton({
        title: 'Restore Your Past Purchases',
        bottom: 5, height: 40, left: 5, right: 5
    });
    restoreCompletedTransactions.addEventListener('click', function() {
        Ti.Storekit.restoreCompletedTransactions();
    });
    Ti.Storekit.addEventListener('restoredCompletedTransactions', function(evt) {
        Ti.API.info('Finished restoring past purchases!');
        if (evt.error) {
            alert(evt.error);
        }
        else if (evt.transactions == null || evt.transactions.length == 0) {
            alert('There were no transactions to restore!');
        }
        else {
            for (var i = 0; i < evt.transactions.length; i++) {
                var t = evt.transactions[i];
                alert({
                    state: t.state,
                    identifier: t.identifier,
                    productIdentifier: t.productIdentifier,
                    quantity: t.quantity,
                    date: t.date,
                    receipt: t.receipt
                });
            }
        }
    });
    win.add(restoreCompletedTransactions);
}

win.open();