<?php
include_once '../web/include/config.php';
$instanceId = file_get_contents('http://169.254.169.254/latest/meta-data/instance-id');

$elb = new AmazonELB();

$response = $elb->register_instances_with_load_balancer('divvy', array(
    array('InstanceId' => $instanceId)
));

var_dump($response->isOK());
?>
