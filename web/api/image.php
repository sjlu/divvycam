<?php
include_once '../include/config.php';

function get_image($image_id)
{
   $image = db_query('SELECT filename FROM photos WHERE id="%s" LIMIT 1', $image_id);

   if (count($image) < 1 || count($image) > 1)
      return array('status' => 'error', 'error' => 'no_such_image');

   $s3 = new AmazonS3();
   return array('status' => 'success', 'url' => $s3->get_object_url('divvycam', $image[0]['filename'] . '.jpg', '60 seconds'));
}

echo json_encode(get_image($_GET['image_id']));

?>
