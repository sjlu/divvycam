<?php
// setup
include_once '../web/include/config.php';
require_once 'ApnsPHP/Autoload.php';
$push = new ApnsPHP_Push(ApnsPHP_Abstract::ENVIRONMENT_PRODUCTION, 'ios_push_production.pem');
$push->setRootCertificationAuthority('entrust_root_certification_authority.pem');


// connection, sending messages
$push->connect();

// get messages
$notifications = db_query('SELECT COUNT(*), buckets.name, photos_notifications.bucket_id, devices.push_key FROM photos_notifications LEFT JOIN buckets ON photos_notifications.bucket_id = buckets.id LEFT JOIN devices ON photos_notifications.duid = devices.duid WHERE devices.push_key != "" GROUP BY photos_notifications.bucket_id, photos_notifications.duid;');
db_query('DELETE FROM photos_notifications');

foreach ($notifications as $notification)
{
   if (is_null($notification['push_key']))
      continue;
	
	if ($notification['COUNT(*)'] > 1)
		$lang = 'photos';
	else
		$lang = 'photo';

   $message = new ApnsPHP_Message($notification['push_key']);
   $message->setCustomIdentifier('photo-notification');
   $message->setText($notification['COUNT(*)'] . ' new ' . $lang . ' in "' . $notification['name'] . '"');
   $message->setSound();
   $message->setCustomProperty('bucket_id', $notification['bucket_id']);
   $message->setExpiry(30);

   $push->add($message);
}

// adding the message and sending it.
if (count($notifications) > 0)
   $push->send();

// disconnecting from APS
$push->disconnect();
?>
