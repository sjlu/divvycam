<?php
include_once '../include/config.php';

function delete_bucket_reference($duid, $bucket_id)
{
	$query = db_query('SELECT COUNT(*) FROM buckets_devices WHERE duid="%s" AND bucket_id="%s"; DELETE FROM buckets_devices WHERE duid="%s" AND bucket_id="%s" LIMIT 1', $duid, $bucket_id, $duid, $bucket_id);
	
	if ($query[0]['COUNT(*)'] > 1 || $query[0]['COUNT(*)'] < 1)
		return '{"status":"error", "error":"device_not_registered_to_bucket"}';
		
	return '{"status":"success"}';
}

if (!isset($_GET['duid']) || !isset($_GET['id']))
{
	echo '{"status":"error", "error":"invalid_request"}';
   die();
}

echo delete_bucket_reference($_GET['duid'], $_GET['id']);
?>