<?php
// Error handling
function error_handler()
{
   if ($e = error_get_last())
   {
      if ($e['type'] === E_ERROR || $e['type'] === E_USER_ERROR)
      {
         $file = $e['file'];
         $message = $e['message'];
         $line = $e['line'];

         $email = 'An error occured in ' . $file . ' on line ' . $line . ".\n";
         $email .= $message . "\n";
         error_log($email, 1, 'slu@burst-dev.com');
      }
   }
}

//set_error_handler('error_handler');
register_shutdown_function('error_handler');

// Need amazon classes
include 'aws/sdk.class.php';

// Setting up the DB
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

// Just a token we can use
define('BLOWFISH_SECRET', '4rehAJasaPrafrU2a4e4wapraS89CRa6');

// Connecting to the database
include 'database.php';
db_connect();

// No need to show the user the error
ini_set('display_errors', 'Off');
//session_start();

// include global helpers
include_once('helpers.php');

// include any other sub helpers
$info = pathinfo($_SERVER['PHP_SELF']);
$filename = basename($_SERVER['PHP_SELF'], '.' . $info['extension']);

if (file_exists('helpers/' . $filename . '.php'))
   include_once('helpers/' . $filename . '.php');
?>
