<?php
   //Use this only for development mode. Set this equal to 0 when moving to production mode.
   define('DEBUG', 1);

   //show all php errors if debug is 1
   if(DEBUG)
   {
      error_reporting(E_ALL);
      ini_set('display_errors', '1');
   }


   /** This is a nice version of print_r you can use while debugging webpages. It'll print the array prettier. */
   function debug_r($arr)
   {
      if(DEBUG)
      {
         echo '<pre>';
         print_r($arr);
         echo '</pre>';
      }
   }

   /** This function prints out the html encoded version of text. If you are printing out a variable and you know it doesn't contain html, use encho() instead of echo(). Helps a lot in avoiding XSS bugs. */
   function encho($text)
   {
      echo htmlspecialchars($text);
   }
   
   /** This function connects us to the database defined in the macros above. */
   function db_connect()
   {
      $success = mysql_connect(DB_HOST, DB_USER, DB_PASS);     
      if(!$success)
         if(DEBUG)
            exit('MySQL connection failed on line '. __LINE__. ' in file '. __FILE__. "\n");
         else
            echo 'The database connection failed';

      mysql_select_db(DB_NAME);
   }

   /** This function is equivalent to calling mysql_query(sprintf(query, ...)). It will mysql_real_escape all args after the first arg in sprintf.
    * This is awesome for avoiding SQL injections.
    * You can set sql_explain=1 in the $_REQUEST to debug sql_queries.
    */
   function db_query($query)
   {
      $num_args = func_num_args();

      $args = array();
      $args[] = $query;

      for($i = 1; $i < $num_args; $i++)
      {
         $args[] = mysql_real_escape_string(func_get_arg($i));
      }

      $query = call_user_func_array('sprintf', $args);

      $mReturnData = array();
      $mResult = @mysql_query($query) or die(log_error(mysql_error(), $query)); 

      while($row = @mysql_fetch_array($mResult, MYSQL_ASSOC))
         $mReturnData[] = $row;
      
      return $mReturnData;
   }
   
   function log_error($error, $query)
   {
      error_log('FILE: ' . __FILE__ . ' LINE: ' . __LINE__ . '\nERROR: ' . $error . '\nQUERY: ' . $query . '\n');
   }
?>
