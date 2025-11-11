<?php
include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if($db) {
    echo "Database connection successful!";
} else {
    echo "Connection failed: " . print_r(sqlsrv_errors(), true);
}
?>