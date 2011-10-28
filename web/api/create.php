<?php
include_once '../include/config.php';

function create_bucket($duid, $name, $password)
{
   db_query('INSERT INTO buckets (duid, name, password) VALUES ("%s", "%s", AES_ENCRYPT("%s", "%s"))',$duid,$name,BLOWFISH_SECRET,$password);

   $newBucket = db_query('SELECT id,name FROM buckets WHERE duid="%s" ORDER BY id DESC LIMIT 1', $duid);
	db_query('INSERT INTO buckets_devices (duid, bucket_id) VALUES ("%s", "%s")', $duid, $newBucket[0]['id']);

   $output = array();
   $output['status'] = 'success';
   $output['bucket_id'] = $newBucket[0]['id'];
   $output['bucket_name'] = $newBucket[0]['name'];

   return $output;
}

if (isset($_POST['duid']) && isset($_POST['name']) && isset($_POST['password']))
   echo json_encode(create_bucket($_POST['duid'], $_POST['name'], $_POST['password']));
else
   echo '{"status":"error", "error":"invalid_request"}';
?>
