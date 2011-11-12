<?php
   //Use this only for development mode. Set this equal to 0 when moving to production mode.
   $mysqli;

   /** This function connects us to the database defined in the macros above. */
   function db_connect()
   {
      global $mysqli;
      $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME) or die("MySQL connection failed.");
   }

   /** This function is equivalent to calling mysql_query(sprintf(query, ...)). It will mysql_real_escape all args after the first arg in sprintf.
    * This is awesome for avoiding SQL injections.
    * You can set sql_explain=1 in the $_REQUEST to debug sql_queries.
    */
   function db_query($query)
   {
      global $mysqli;

      $num_args = func_num_args();

      $args = array();
      $args[] = $query;

      for($i = 1; $i < $num_args; $i++)
      {
         $args[] = mysql_real_escape_string(func_get_arg($i));
      }

      $query = call_user_func_array('sprintf', $args);

      if (!$result = $mysqli->query($query))
         die(log_error($mysqli->error, $query));
      
      $returnData = array();

      while($row = $result->fetch_array(MYSQLI_ASSOC))
         $returnData[] = $row;
      
      $result->close();

      return $returnData;
   }
   
   function log_error($error, $query)
   {
      trigger_error('FILE: ' . __FILE__ . ' LINE: ' . __LINE__ . '\nERROR: ' . $error . '\nQUERY: ' . $query . '\n', E_ERROR);
   }
?>
