function parseQS(qstring) {
 
   // The return is a collection of key/value pairs
	var queryStringDictionary = {};
 
   // Gets the query string, starts with '?'
   var querystring = qstring;
 
   if (!querystring) {
       return {};
   }
 
   // split by ampersand '&' ---
   var querystring = querystring.split("?"); // there should only be 1 question mark by default
   var pairs = querystring[1].split("&");
 
   // Load the key/values of the return collection
   for (var i = 0; i < pairs.length; i++) {
		var keyValuePair = pairs[i].split("=");
      queryStringDictionary[keyValuePair[0]]
			= keyValuePair[1];
   }
 
    // toString() returns the key/value pairs concatenated
 
	queryStringDictionary.toString = function() {
 
		if (queryStringDictionary.length == 0) {
			return "";
		}
		var toString = "?";
 
		for (var key in queryStringDictionary) {
			toString += key + "=" +
				queryStringDictionary[key];
		}
		
		return toString;
	};
 
	// Return the key/value dictionary
 
	return queryStringDictionary;
}

function autoFillJoinWindow(cmdObj)
{
	if (cmdObj.hasOwnProperty('bucketId') && cmdObj.hasOwnProperty("bucketPw"))
		Divvy.Join.openWithValues(cmdObj.bucketId, cmdObj.bucketPw);
}

// Save initial launch command line arguments
Ti.App.launchURL = '';
Ti.App.pauseURL = '';

Divvy.cmd = Ti.App.getArguments();
if (Divvy.cmd.hasOwnProperty('url'))
{
	if (Divvy.cmd.url != Ti.App.argsURL)
	{
		Ti.App.argsURL = Divvy.cmd.url;
		autoFillJoinWindow(parseQS(Divvy.cmd.url));
	}
}
 
// After app is fully resumed, recheck if launch arguments
// have changed and ignore duplicate schemes.
Ti.App.addEventListener('resumed', function(e)
{
	Divvy.cmd = Ti.App.getArguments();

	if (Divvy.cmd.hasOwnProperty('url'))
	{
		if (Divvy.cmd.url != Ti.App.argsURL)
		{
			Ti.App.argsURL = Divvy.cmd.url;
			autoFillJoinWindow(parseQS(Divvy.cmd.url));
		}
   }
});