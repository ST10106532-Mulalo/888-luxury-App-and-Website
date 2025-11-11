<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");

// Always return valid JSON, even on errors
try {
    include_once '../config/database.php';

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    $method = $_SERVER['REQUEST_METHOD'];

    switch($method) {
        case 'GET':
            // Get all vehicles
            $query = "SELECT * FROM vehicles WHERE is_active = 1";
            $stmt = sqlsrv_query($db, $query);
            
            $vehicles = [];
            if ($stmt) {
                while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
                    // Convert features from JSON string to array
                    if (isset($row['features']) && is_string($row['features'])) {
                        $row['features'] = json_decode($row['features'], true) ?: [];
                    }
                    $vehicles[] = $row;
                }
            }
            
            echo json_encode([
                "success" => true,
                "data" => $vehicles
            ]);
            break;
            
        case 'POST':
            // Add new vehicle
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            
            if (!$data) {
                throw new Exception("Invalid JSON input");
            }
            
            $query = "INSERT INTO vehicles (name, type, price, description, features, image_url) 
                      VALUES (?, ?, ?, ?, ?, ?)";
            
            $params = [
                $data['name'] ?? '',
                $data['type'] ?? 'car',
                $data['price'] ?? 0,
                $data['description'] ?? '',
                json_encode($data['features'] ?? []),
                $data['image_url'] ?? '🚗'
            ];
            
            $stmt = sqlsrv_query($db, $query, $params);
            
            if ($stmt) {
                echo json_encode(["success" => true, "message" => "Vehicle added successfully"]);
            } else {
                throw new Exception("Failed to add vehicle: " . print_r(sqlsrv_errors(), true));
            }
            break;
            
        case 'DELETE':
            // Delete vehicle
            $id = $_GET['id'] ?? null;
            if ($id) {
                $query = "DELETE FROM vehicles WHERE id = ?";
                $stmt = sqlsrv_query($db, $query, [$id]);
                
                if ($stmt) {
                    echo json_encode(["success" => true, "message" => "Vehicle deleted successfully"]);
                } else {
                    throw new Exception("Failed to delete vehicle");
                }
            } else {
                throw new Exception("No vehicle ID provided");
            }
            break;
            
        default:
            throw new Exception("Invalid method: " . $method);
    }
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>