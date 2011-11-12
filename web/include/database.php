<?php
   /** This function connects us to the database defined in the macros above. */
   function db_connect()
   {
      $success = mysql_connect(DB_HOST, DB_USER, DB_PASS);     
      if(!$success)
         db_log_error('MySQL connection error.');

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
      $mResult = @mysql_query($query) or die(db_log_error(mysql_error(), $query)); 

      while($row = @mysql_fetch_assoc($mResult))
         $mReturnData[] = $row;
      
      return $mReturnData;
   }
   
   function db_log_error($error, $query)
   {
      trigger_error('FILE: ' . __FILE__ . ' LINE: ' . __LINE__ . '\nERROR: ' . $error . '\nQUERY: ' . $query . '\n', E_USER_ERROR);
   }
?>
