<?php
include_once '../include/config.php';

function join_bucket($duid, $id, $password)
{
   $pw_verify = db_query('SELECT id, name, AES_DECRYPT(password, "%s") AS secret FROM buckets WHERE id="%s" LIMIT 1', $password, $id);

   if (count($pw_verify) > 1 || count($pw_verify) < 1)
      return array('status' => 'error', 'error' => 'no_such_bucket');

   if ($pw_verify[0]['secret'] !== BLOWFISH_SECRET)
      return array('status' => 'error', 'error' => 'pw_incorrect');

	db_query('INSERT IF NOT EXISTS buckets_devices (duid, bucket_id) VALUES ("%s", "%s")', $duid, $pw_verify[0]['id']);

   $output = array();
   $output['status'] = 'success';
   $output['bucket_id'] = $pw_verify[0]['id'];
   $output['bucket_name'] = $pw_verify[0]['name'];

   db_query('UPDATE buckets SET last_updated=CURRENT_TIMESTAMP WHERE id="%s"', $id);

   return $output;
}

if (isset($_POST['bucket_id']) && isset($_POST['password']) && isset($_POST['duid']))
   echo json_encode(join_bucket($_POST['duid'], $_POST['bucket_id'], $_POST['password']));
else
   echo '{"status":"error", "error":"invalid_request"}';
?>
