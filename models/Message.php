<?php
class Message {
    private $conn;
    private $table_name = "messages";

    public $id;
    public $customer_id;
    public $customer_name;
    public $customer_email;
    public $customer_phone;
    public $subject;
    public $message;
    public $type;
    public $status;
    public $reply;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all messages
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        
        $stmt = sqlsrv_query($this->conn, $query);
        return $stmt;
    }

    // Get single message by ID
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
        
        $params = array($this->id);
        $stmt = sqlsrv_query($this->conn, $query, $params);
        
        if ($stmt && sqlsrv_fetch($stmt)) {
            $this->customer_id = sqlsrv_get_field($stmt, 1);
            $this->subject = sqlsrv_get_field($stmt, 2);
            $this->message = sqlsrv_get_field($stmt, 3);
            $this->type = sqlsrv_get_field($stmt, 4);
            $this->status = sqlsrv_get_field($stmt, 5);
            $this->reply = sqlsrv_get_field($stmt, 6);
            $this->created_at = sqlsrv_get_field($stmt, 7);
            
            return true;
        }
        return false;
    }

    // Create new message
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 (customer_name, customer_email, customer_phone, subject, message, type, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'unread')";
        
        $params = array(
            $this->customer_name,
            $this->customer_email,
            $this->customer_phone,
            $this->subject,
            $this->message,
            $this->type
        );
        
        $stmt = sqlsrv_query($this->conn, $query, $params);
        
        if ($stmt) {
            return true;
        }
        return false;
    }

    // Update message reply
    public function updateReply() {
        $query = "UPDATE " . $this->table_name . " 
                 SET reply = ?, status = 'replied' 
                 WHERE id = ?";
        
        $params = array($this->reply, $this->id);
        $stmt = sqlsrv_query($this->conn, $query, $params);
        
        if ($stmt) {
            return true;
        }
        return false;
    }

    // Update message status
    public function updateStatus() {
        $query = "UPDATE " . $this->table_name . " 
                 SET status = ? 
                 WHERE id = ?";
        
        $params = array($this->status, $this->id);
        $stmt = sqlsrv_query($this->conn, $query, $params);
        
        if ($stmt) {
            return true;
        }
        return false;
    }

    // Delete message
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $params = array($this->id);
        $stmt = sqlsrv_query($this->conn, $query, $params);
        
        if ($stmt) {
            return true;
        }
        return false;
    }
}
?>