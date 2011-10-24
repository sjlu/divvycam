<?php
include_once '../include/config.php';

function join_bucket($id, $password)
{
   $pw_verify = db_query('SELECT id, name, AES_DECRYPT(password, "%s") AS secret FROM buckets WHERE id="%s" LIMIT 1', $password, $id);

   if (count($pw_verify) > 1 || count($pw_verify) < 1)
      return array('status' => 'error', 'error' => 'no_such_bucket');

   if ($pw_verify[0]['secret'] !== BLOWFISH_SECRET)
      return array('status' => 'error', 'error' => 'pw_incorrect');

   $output = array();
   $output['status'] = 'success';
   $output['bucket_id'] = $pw_verify[0]['id'];
   $output['bucket_name'] = $pw_verify[0]['name'];

   return $output;
}

if (isset($_POST['bucket_id']) && isset($_POST['password']))
   echo json_encode(join_bucket($_POST['bucket_id'], $_POST['password']));
else
   echo '{"status":"error", "error":"invalid_request"}';
?>
