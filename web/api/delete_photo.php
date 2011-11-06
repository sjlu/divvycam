<?php
include_once '../include/config.php';

function check_photo_permissions($duid, $photo_id)
{
	$query = db_query('SELECT duid FROM photos WHERE id="%s" AND duid="%s"', $photo_id, $duid);
	
	if (count($query) > 1 || count($query) < 1 || $query[0]['duid'] !== $duid)
		return false;
		
	return true;
}

function delete_photo($photo_id)
{
	$query = db_query('SELECT filename FROM photos WHERE id="%s"', $photo_id);
	
	if (count($query) > 1 || count($query) < 1)
		return '{"status":"error", "error","photo_not_found"}';
	
	$s3 = new AmaoznS3();
	$response = $s3->delete_object('divvycam', $query[0]['filename']);
	
	if ($response->isOK())
	{
		db_query('DELETE FROM photos WHERE id="%s" LIMIT 1', $photo_id);
		return '{"status":"success"}';
	}
	else
		return '{"status":"error", "status","could_not_delete"}';
}

if (!isset($_GET['duid']) || !isset($_GET['id']))
{
	echo '{"status":"error", "error":"invalid_request"}';
   die();
}

if (!check_photo_permissions($_GET['duid'], $_GET['id']))
{
	echo '{"status":"error", "error":"permission_denied"}';
	die();
}

echo delete_photo($_GET['id']);
?>