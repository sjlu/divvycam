<?php
include_once '../include/config.php';

function upload_to_s3($file, $filename)
{
   $s3 = new AmazonS3();

   $imagick = new Imagick($file);
   $imagick->setImageCompression(imagick::COMPRESSION_JPEG);
   $imagick->setImageCompressionQuality(90);
   $imageFile = tempnam('/tmp', 'image_');
   $imagick->writeImage($imageFile);

   $response = $s3->create_object('divvycam', $filename . '.jpg', array(
      'fileUpload' => $imageFile,
      'acl' => AmazonS3::ACL_PRIVATE,
      'storage' => AmazonS3::STORAGE_REDUCED,
      'contentType' => 'image/jpg'
   ));

   if (!$response->isOK())
      return false;

   $imagick = new Imagick($file);
   $imagick->setImageCompression(imagick::COMPRESSION_JPEG);
   $imagick->setImageCompressionQuality(65);
   $imagick->cropThumbnailImage(200,200);
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

function add_image_to_db($bucket_id, $filename, $duid)
{
	$s3 = new AmazonS3();
	$response = $s3->get_object_filesize('divvycam', $filename . '.jpg');
	
   db_query('INSERT INTO photos (bucket_id, filename, duid, filesize) VALUES ("%s","%s","%s","%s")', $bucket_id, $filename, $duid, $response);
	update_timestamps($duid, $bucket_id);
   return true;
}

if ($_FILES["image"]["error"] > 0)
{
   error_log($_FILES["image"]["error"], 0);
   echo '{"status":"error", "error":"file_upload_error"}';
   die();
}

if (!isset($_POST["bucket_id"]) || !isset($_POST["duid"]))
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

if (!check_if_user_belongs_to_bucket($_POST['duid'], $_POST['bucket_id']))
{
	echo '{"status":"error", "error":"permission_denied"}';
	die();
}

$file = $_FILES["image"]["tmp_name"];
$bucket_id = $_POST['bucket_id'];
$duid = $_POST['duid'];

$filename = $bucket_id . "-" . md5($file);

if (!upload_to_s3($file, $filename))
{
   echo '{"status":"error", "error":"s3_object_issue"}';
   die();
}

if (!add_image_to_db($bucket_id, $filename, $duid))
{
   echo '{"status":"error", "error":"db_error"}';
   die();
}

echo '{"status":"success"}';
?>
