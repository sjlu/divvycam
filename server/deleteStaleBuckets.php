<?php
include_once '../web/include/config.php';

$photos = db_query('SELECT id,filename FROM photos WHERE bucket_id IN (SELECT id FROM buckets WHERE last_updated <= "%s")', date('Y-m-d', strtotime("-2 weeks")));

$s3 = new AmazonS3();
foreach ($photos as $photo)
{
   $response_photo = $s3->delete_object('divvycam', $photo['filename'] . '.jpg');
   $response_thumb = $s3->delete_object('divvycam', $photo['filename'] . '-thumbnail.jpg');

   if ($response_photo->isOK() && $response_thumb->isOK())
      db_query('DELETE FROM photos WHERE id="%s" LIMIT 1', $photo['id']);
}

db_query('DELETE FROM photos WHERE bucket_id IN (SELECT id FROM buckets WHERE last_updated <= "%s")', date('Y-m-d', strtotime("-2 weeks")));
?>
