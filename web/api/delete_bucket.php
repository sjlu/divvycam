<?php
include_once '../include/config.php';

function delete_bucket_reference($duid, $bucket_id)
{
	$query = db_query('SELECT COUNT(*) FROM buckets_devices WHERE duid="%s" AND bucket_id="%s"', $duid, $bucket_id);
	
	if ($query[0]['COUNT(*)'] > 1 || $query[0]['COUNT(*)'] < 1)
		return '{"status":"error", "error":"device_not_registered_to_bucket"}';
	
	$query = db_query('DELETE FROM buckets_devices WHERE duid="%s" AND bucket_id="%s" LIMIT 1', $duid, $bucket_id);
		
	return '{"status":"success"}';
}

if (!isset($_POST['duid']) || !isset($_POST['id']))
{
	echo '{"status":"error", "error":"invalid_request"}';
   die();
}

echo delete_bucket_reference($_POST['duid'], $_POST['id']);
?>