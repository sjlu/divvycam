// open a single window
var window = Ti.UI.createWindow({
	backgroundColor:'white'
});

var feedback_button = Ti.UI.createButton({
  title: 'Show feedback',
  left: 10,
  right: 10,
  top: 10,
  height: 40
});
window.add(feedback_button);

var checkpoint_button = Ti.UI.createButton({
  title: 'Mark checkpoint',
  left: 10,
  right: 10,
  top: 60,
  height: 40
});
window.add(checkpoint_button);

window.open();

var testflight = require('com.0x82.testflight');
Ti.API.info("module is => " + testflight);

testflight.takeOff('eb5275a5b23950dc0dcd58542806222b_MzUyMg');
testflight.addCustomEnvironmentInformation({
  username: 'username',
  session_id: '123123123123123',
  other_example: 'other_value'
});

feedback_button.addEventListener('click', function(e) {
  testflight.openFeedbackView();
});
checkpoint_button.addEventListener('click', function(e) {
  testflight.passCheckpoint("CHECKPOINT 1");
});

