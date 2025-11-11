<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get all messages
        $query = "SELECT * FROM messages ORDER BY created_at DESC";
        $stmt = sqlsrv_query($db, $query);
        
        $messages = [];
        if ($stmt) {
            while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
                $messages[] = $row;
            }
        }
        
        echo json_encode([
            "success" => true,
            "data" => $messages
        ]);
        break;
        
    case 'POST':
        // Create new message
        $data = json_decode(file_get_contents("php://input"), true);
        
        $query = "INSERT INTO messages (customer_name, customer_email, customer_phone, subject, message, type, status) 
                  VALUES (?, ?, ?, ?, ?, ?, 'unread')";
        
        $params = [
            $data['customer_name'],
            $data['customer_email'],
            $data['customer_phone'] ?? '',
            $data['subject'] ?? 'General Inquiry',
            $data['message'],
            $data['type'] ?? 'general'
        ];
        
        $stmt = sqlsrv_query($db, $query, $params);
        
        if ($stmt) {
            echo json_encode(["success" => true, "message_id" => "MSG" . date('YmdHis')]);
        } else {
            echo json_encode(["success" => false, "error" => "Failed to send message"]);
        }
        break;
        
    case 'PUT':
        // Update message (reply or status)
        $data = json_decode(file_get_contents("php://input"), true);
        
        $id = $data['id'] ?? null;
        $reply = $data['reply'] ?? null;
        $status = $data['status'] ?? null;
        
        if ($id) {
            if ($reply) {
                $query = "UPDATE messages SET reply = ?, status = 'replied' WHERE id = ?";
                $params = [$reply, $id];
            } elseif ($status) {
                $query = "UPDATE messages SET status = ? WHERE id = ?";
                $params = [$status, $id];
            } else {
                echo json_encode(["success" => false, "error" => "No update data provided"]);
                exit;
            }
            
            $stmt = sqlsrv_query($db, $query, $params);
            
            if ($stmt) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to update message"]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "No message ID provided"]);
        }
        break;
        
    default:
        echo json_encode(["success" => false, "error" => "Invalid method"]);
}
?>