<?php
// config/database.php
class Database {
    private $serverName = "LabVM1846780\\SQLEXPRESS";
    private $connectionOptions = array(
        "Database" => "luxury_rentals",
        "Uid" => "sa",                    // ← Most common username
        "PWD" => "YourPassword123"        // ← CHANGE THIS TO YOUR ACTUAL PASSWORD
    );
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = sqlsrv_connect($this->serverName, $this->connectionOptions);
            if($this->conn === false) {
                die(print_r(sqlsrv_errors(), true));
            }
        } catch(Exception $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>