<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT");

try {
    include_once '../config/database.php';

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed: " . print_r(sqlsrv_errors(), true));
    }

    $method = $_SERVER['REQUEST_METHOD'];

    switch($method) {
        case 'GET':
            // Get all bookings
            $query = "SELECT * FROM bookings ORDER BY created_at DESC";
            $stmt = sqlsrv_query($db, $query);
            
            $bookings = [];
            if ($stmt) {
                while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
                    $bookings[] = $row;
                }
            }
            
            echo json_encode([
                "success" => true,
                "data" => $bookings
            ]);
            break;
            
        case 'POST':
            // Create new booking
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            
            if (!$data) {
                throw new Exception("Invalid JSON input");
            }
            
            // First, check if customer exists or create new one
            $customerQuery = "SELECT id FROM customers WHERE email = ?";
            $customerStmt = sqlsrv_query($db, $customerQuery, [$data['customer_email']]);
            
            $customerId = null;
            if ($customerStmt && sqlsrv_fetch($customerStmt)) {
                $customerId = sqlsrv_get_field($customerStmt, 0);
            } else {
                // Create new customer
                $insertCustomer = "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)";
                $customerStmt = sqlsrv_query($db, $insertCustomer, [
                    $data['customer_name'],
                    $data['customer_email'],
                    $data['customer_phone']
                ]);
                
                if ($customerStmt) {
                    // Get the last inserted customer ID
                    $customerIdQuery = "SELECT SCOPE_IDENTITY() AS id";
                    $customerIdStmt = sqlsrv_query($db, $customerIdQuery);
                    if ($customerIdStmt && sqlsrv_fetch($customerIdStmt)) {
                        $customerId = sqlsrv_get_field($customerIdStmt, 0);
                    }
                }
            }
            
            if (!$customerId) {
                throw new Exception("Failed to get or create customer");
            }
            
            // Get vehicle ID by name
            $vehicleQuery = "SELECT id FROM vehicles WHERE name = ?";
            $vehicleStmt = sqlsrv_query($db, $vehicleQuery, [$data['vehicle_name']]);
            $vehicleId = null;
            if ($vehicleStmt && sqlsrv_fetch($vehicleStmt)) {
                $vehicleId = sqlsrv_get_field($vehicleStmt, 0);
            }
            
            // Create booking
            $bookingQuery = "INSERT INTO bookings (customer_id, vehicle_id, start_date, end_date, total_amount, status, special_requirements) 
                            VALUES (?, ?, ?, ?, ?, 'pending', ?)";
            
            $bookingParams = [
                $customerId,
                $vehicleId,
                $data['start_date'],
                $data['end_date'],
                $data['total_amount'],
                $data['message'] ?? ''
            ];
            
            $bookingStmt = sqlsrv_query($db, $bookingQuery, $bookingParams);
            
            if ($bookingStmt) {
                echo json_encode([
                    "success" => true, 
                    "booking_id" => "BK" . date('YmdHis'),
                    "message" => "Booking created successfully"
                ]);
            } else {
                throw new Exception("Failed to create booking: " . print_r(sqlsrv_errors(), true));
            }
            break;
            
        case 'PUT':
            // Update booking status
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            
            if (!$data) {
                throw new Exception("Invalid JSON input");
            }
            
            $id = $data['id'] ?? null;
            $status = $data['status'] ?? null;
            
            if ($id && $status) {
                $query = "UPDATE bookings SET status = ? WHERE id = ?";
                $stmt = sqlsrv_query($db, $query, [$status, $id]);
                
                if ($stmt) {
                    echo json_encode(["success" => true, "message" => "Booking updated successfully"]);
                } else {
                    throw new Exception("Failed to update booking: " . print_r(sqlsrv_errors(), true));
                }
            } else {
                throw new Exception("Missing booking ID or status");
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