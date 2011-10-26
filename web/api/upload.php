<?php
include_once '../include/config.php';

function upload_to_s3($file, $filename)
{
   $s3 = new AmazonS3();

   $response = $s3->create_object('divvycam', $filename . '.jpg', array(
      'fileUpload' => $file,
      'acl' => AmazonS3::ACL_PRIVATE,
      'storage' => AmazonS3::STORAGE_REDUCED,
      'contentType' => 'image/jpg'
   ));

   if (!$response->isOK())
      return false;

   $imagick = new Imagick($file);
   $imagick->cropThumbnailImage(100,100);
   $thumbnailFile = tempnam('/tmp', 'thumb_');
   $imagick->writeImage($thumbnailFile);

   $response = $s3->create_object('divvycam', $filename . '-thumbnail.jpg', array(
      'fileUpload' => $thumbnailFile,
      'acl' => AmazonS3::ACL_PRIVATE,
      'storage' => AmazonS3::STORAGE_REDUCED,
      'contentType' => 'image/jpg'
   ));

   if ($response->isOK())
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

function add_image_to_db($bucket_id, $filename)
{
   db_query('INSERT INTO photos (bucket_id, filename) VALUES ("%s","%s")', $bucket_id, $filename);
   db_query('UPDATE buckets SET last_updated=CURRENT_TIMESTAMP WHERE id="%s"', $bucket_id);
   return true;
}

if ($_FILES["image"]["error"] > 0)
{
   error_log($_FILES["image"]["error"], 0);
   echo '{"status":"error", "error":"file_upload_error"}';
   die();
}

if (!isset($_POST["bucket_id"]))
{
   echo '{"status":"error", "error":"invalid_request"}';
   die();
}

if (!file_exists($_FILES["image"]["tmp_name"]))
{
   echo '{"status":"error", "error":"file_upload_error"}';
   die();
}

if (!check_if_bucket_exists($_POST['bucket_id']))
{
   echo '{"status":"error", "error":"no_such_bucket"}';
   die();
}

$file = $_FILES["image"]["tmp_name"];
$bucket_id = $_POST['bucket_id'];

$filename = $bucket_id . "-" . md5($file);

if (!upload_to_s3($file, $filename))
{
   echo '{"status":"error", "error":"s3_object_issue"}';
   die();
}

if (!add_image_to_db($bucket_id, $filename))
{
   echo '{"status":"error", "error":"db_error"}';
   die();
}

echo '{"status":"success"}';
?>
