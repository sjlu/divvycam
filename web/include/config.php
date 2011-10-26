<?php
include 'aws/sdk.class.php';

if (isset($_SERVER['db_hostname']))
{
   define('DB_HOST', getenv('db_hostname'));
}
else
{
   if (gethostname() == 'ip-10-202-187-8')
      define('DB_HOST', 'localhost');
   else
      define('DB_HOST', 'ip-10-202-187-8.ec2.internal');
}

define('DB_NAME', 'divvy');
define('DB_USER', 'divvy');
define('DB_PASS', 'sRYbwWjK2t6DGTTH');

define('BLOWFISH_SECRET', '4rehAJasaPrafrU2a4e4wapraS89CRa6');

include 'database.php';
db_connect();

ini_set('display_errors', 'Off');
session_start();

include_once('helpers.php');

$info = pathinfo($_SERVER['PHP_SELF']);
$filename = basename($_SERVER['PHP_SELF'], '.' . $info['extension']);

if (file_exists('helpers/' . $filename . '.php'))
   include_once('helpers/' . $filename . '.php');
?>
