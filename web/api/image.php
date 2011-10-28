<?php
include_once '../include/config.php';

function get_image($image_id, $duid)
{
   $image = db_query('SELECT bucket_id,filename FROM photos WHERE id="%s" LIMIT 1', $image_id);

   if (count($image) < 1 || count($image) > 1)
      return array('status' => 'error', 'error' => 'no_such_image');

	if (check_if_user_belongs_to_bucket($duid, $image[0]['bucket_id']))
		return array('status' => 'error', 'error' => 'permission_denied');

	db_query('UPDATE buckets_devices SET last_activity=CURRENT_TIMESTAMP WHERE bucket_id="%s" AND duid="%s"', $image[0]['bucket_id'], $duid);

   $s3 = new AmazonS3();
   return $s3->get_object_url('divvycam', $image[0]['filename'] . '.jpg', '60 seconds');
}

echo json_encode(get_image($_GET['image_id']));
?>
