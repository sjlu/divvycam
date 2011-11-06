<?php
// setup
require_once 'ApnsPHP/Autoload.php';
$push = new ApnsPHP_Push(ApnsPHP_Abstract::ENVIRONMENT_SANDBOX, 'ios_push_development.pem');
$push->setRootCertificationAuthority('entrust_root_certification_authority.pem');

// connection, sending messages
$push->connect();

// make a message
$message = new ApnsPHP_Message('');
$message->setCustomIdentifier('photo-notification');
$message->setBadge(1);
$message->setText('Your friend');
$message->setSound();
$message->setCustomProperty('bucket_id', '');
$message->setExpiry(30);

// adding the message and sending it.
$push->add($message);
$push->send();

// disconnecting from APS
$push->disconnect();
?>