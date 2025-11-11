<?php
// models/Booking.php
class Booking {
    private $conn;
    private $table_name = "bookings";

    public $id;
    public $customer_id;
    public $vehicle_id;
    public $start_date;
    public $end_date;
    public $total_amount;
    public $status;
    public $special_requirements;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (customer_id, vehicle_id, start_date, end_date, total_amount, status, special_requirements) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)";

        $params = array(
            $this->customer_id,
            $this->vehicle_id,
            $this->start_date,
            $this->end_date,
            $this->total_amount,
            $this->status,
            $this->special_requirements
        );

        $stmt = sqlsrv_query($this->conn, $query, $params);
        if($stmt) {
            return true;
        }
        return false;
    }
}
?>