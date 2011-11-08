<?php
include_once '../include/config.php';

function get_image($duid, $image_id)
{
   $image = db_query('SELECT duid, bucket_id, filename FROM photos WHERE id="%s" LIMIT 1', $image_id);

   if (count($image) < 1 || count($image) > 1)
      return array('status' => 'error', 'error' => 'no_such_image');

	if (!check_if_user_belongs_to_bucket($duid, $image[0]['bucket_id']))
		return array('status' => 'error', 'error' => 'permission_denied');
	
	if ($image[0]['duid'] == $duid)
		$permissions = '1';
	else
		$permissions = '0';

	update_timestamps($duid, $image[0]['bucket_id']);
	
   $s3 = new AmazonS3();
	return array(
				'status' => 'success', 
				'permissions' => $permissions, 
				'url' => $s3->get_object_url('divvycam', $image[0]['filename'] . '.jpg', '60 seconds')
				);
}

echo json_encode(get_image($_GET['duid'], $_GET['image_id']));
?>
