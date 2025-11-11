<?php
// models/Customer.php
class Customer {
    private $conn;
    private $table_name = "customers";

    public $id;
    public $name;
    public $email;
    public $phone;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    function create() {
        $query = "INSERT INTO " . $this->table_name . " (name, email, phone) VALUES (?, ?, ?)";
        $params = array($this->name, $this->email, $this->phone);
        $stmt = sqlsrv_query($this->conn, $query, $params);
        if($stmt) {
            $this->id = $this->getLastInsertId();
            return true;
        }
        return false;
    }

    function getLastInsertId() {
        $query = "SELECT SCOPE_IDENTITY() AS id";
        $stmt = sqlsrv_query($this->conn, $query);
        if($stmt) {
            $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
            return $row['id'];
        }
        return false;
    }

    function findById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
        $params = array($id);
        $stmt = sqlsrv_query($this->conn, $query, $params);
        if($stmt) {
            $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
            if($row) {
                $this->id = $row['id'];
                $this->name = $row['name'];
                $this->email = $row['email'];
                $this->phone = $row['phone'];
                $this->created_at = $row['created_at'];
                return true;
            }
        }
        return false;
    }

    function findByEmail($email) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE email = ?";
        $params = array($email);
        $stmt = sqlsrv_query($this->conn, $query, $params);
        if($stmt) {
            $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
            if($row) {
                $this->id = $row['id'];
                $this->name = $row['name'];
                $this->email = $row['email'];
                $this->phone = $row['phone'];
                $this->created_at = $row['created_at'];
                return true;
            }
        }
        return false;
    }
}
?>