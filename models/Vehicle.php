<?php
// models/Vehicle.php
class Vehicle {
    private $conn;
    private $table_name = "vehicles";

    public $id;
    public $name;
    public $type;
    public $price;
    public $description;
    public $features;
    public $image_url;
    public $is_active;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    function read() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE is_active = 1";
        $stmt = sqlsrv_query($this->conn, $query);
        return $stmt;
    }
}
?>