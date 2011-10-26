<?php
include_once '../include/config.php';

function get_thumbnails($bucket_id, $limit = -1, $order = "ASC")
{
   if ($limit > 0)
      $limit_string = 'LIMIT %s';
   else
      $limit_string = '';

   $images = db_query('SELECT id,filename FROM photos WHERE bucket_id="%s" ORDER BY id %s ' . $limit_string, $bucket_id, $order, $limit);

   $s3 = new AmazonS3();

   $output = array();
   foreach ($images as $image)
      $output[] = array('id' => $image['id'], 'url' => $s3->get_object_url('divvycam', $image['filename'] . '-thumbnail.jpg', '60 seconds'));

   db_query('UPDATE buckets SET last_updated=CURRENT_TIMESTAMP WHERE id="%s"', $bucket_id);

   return $output;
}

function check_if_bucket_exists($bucket_id)
{
   $check_exists = db_query('SELECT COUNT(*) FROM buckets WHERE id="%s"', $bucket_id);
   if ($check_exists[0]['COUNT(*)'] == 1)
      return true;
   else
      return false;  
}

if (!isset($_GET['bucket_id']))
{
   echo '{"status":"error","error":"invalid_request"}';
   die();
}

if (!check_if_bucket_exists($_GET['bucket_id']))
{
   echo '{"status":"error","error":"no_such_bucket"}';
   die();
}

if (isset($_GET['order']))
{
   if ($_GET['order'] == 'desc')
      $order = 'DESC';
   else
      $order = 'ASC';
}
else
   $order = 'ASC';

if (!isset($_GET['limit']))
   $limit = -1;
else
   $limit = $_GET['limit'];

echo json_encode(array('status' => 'success', 'bucket_id'=> $_GET['bucket_id'], 'thumbnails' => get_thumbnails($_GET['bucket_id'], $limit, $order)));
?>
