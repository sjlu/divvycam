<?php
function check_if_user_belongs_to_bucket($duid, $bucket_id)
{
	$check_exists = db_query('SELECT COUNT(*) FROM buckets_devices WHERE duid="%s" AND bucket_id="%s"', $duid, $bucket_id);
	if ($check_exists[0]['COUNT(*)'] == 1)
		return true;
	else
		return false;
}

function check_if_bucket_exists($bucket_id)
{
   $check_exists = db_query('SELECT COUNT(*) FROM buckets WHERE id="%s"', $bucket_id);
   if ($check_exists[0]['COUNT(*)'] == 1)
      return true;
   else
      return false;  
}

function update_timestamps($duid, $bucket_id)
{
	db_query('UPDATE buckets SET last_updated=CURRENT_TIMESTAMP WHERE id="%s"', $bucket_id);
	db_query('UPDATE buckets_devices SET last_activity=CURRENT_TIMESTAMP WHERE bucket_id="%s" AND duid="%s"', $bucket_id, $duid);
}

function add_image_to_db($bucket_id, $filename, $duid)
{
	$s3 = new AmazonS3();
	$response = $s3->get_object_filesize('divvycam', $filename . '.jpg');
	
   db_query('INSERT INTO photos (bucket_id, filename, duid, filesize) VALUES ("%s","%s","%s","%s")', $bucket_id, $filename, $duid, $response);
	update_timestamps($duid, $bucket_id);
   write_notifications($bucket_id, $duid);
   return true;
}

function write_notifications($bucket_id, $duid)
{
   db_query('INSERT INTO photos_notifications (bucket_id, duid) SELECT bucket_id, duid FROM buckets_devices WHERE bucket_id="%s" AND duid!="%s"', $bucket_id, $duid);
}
?>