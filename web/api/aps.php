<?php
include_once '../include/config.php';

function register_device_to_database($duid, $push_key)
{
	$query = db_query('INSERT INTO devices (duid, push_key) VALUES ("%s","%s") ON DUPLICATE KEY UPDATE', $duid, $push_key);
	return true;		
}

if (!isset($_POST['duid']) || !isset($_POST['push_key']))
{
	echo '{"status":"error", "error":"invalid_request"}';
	die();
}

echo '{"status":"success"}';
?>