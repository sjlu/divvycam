<?php
include_once '../include/config.php';

function copy_photo($filename, $new_filename)
{	
	$s3 = new AmazonS3();
	
	$response_photo = $s3->copy_object(
		array(
			'bucket' => 'divvycam',
			'filename' => $filename . '.jpg'
		),
		array(
			'bucket' => 'divvycam',
			'filename' => $new_filename . '.jpg'
		),
		array(
			'storage' => AmazonS3::STORAGE_REDUCED
		)
	);
	
	$response_thumbnail = $s3->copy_object(
		array(
			'bucket' => 'divvycam',
			'filename' => $filename . '-thumbnail.jpg'
		),
		array(
			'bucket' => 'divvycam',
			'filename' => $new_filename . '-thumbnail.jpg'
		),
		array(
			'storage' => AmazonS3::STORAGE_REDUCED
		)
	);
	
	if ($response_thumbnail->isOK() && $response_photo->isOK())
		return true;
	else
		return false;
}

function grab_photo_info($photo_id)
{
	$query = db_query('SELECT filename FROM photos WHERE id="%s"', $photo_id);
	
	if (count($query) > 1 && count($query) < 1)
		return false;
	
	return $query[0]['filename'];
}

if (!isset($_POST['duid']) || !isset($_POST['bucket_id']) || !isset($_POST['photo_id']))
{
	echo "{'status':'error', 'error':'invalid_request'}";
	die();
}

$filename = grab_photo_info($_POST['photo_id']);
if ($info == false)
{
	echo "{'status':'error', 'error':'no_such_photo'}";
	die();
}

$new_filename = $_POST['bucket_id'] . "-" . md5($filename . time() . $_POST['duid']);

if (copy_photo($filename, $new_filename))
{
	echo "{'status':'error', 'error':'could_not_copy'}";
	die();
}

if (add_image_to_db($_POST['bucket_id'], $new_filename, $_POST['duid']))
{
	echo "{'status':'success'}";
}
else
{
	echo "{'status':'error', 'error':'db_error'}";		
}
?>