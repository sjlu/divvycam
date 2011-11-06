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
?>