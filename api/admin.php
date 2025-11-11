<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Simple admin authentication
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    // Check if JSON decoding was successful
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode([
            "success" => false,
            "error" => "Invalid JSON input"
        ]);
        exit;
    }
    
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    // Simple hardcoded admin check
    if ($username === 'admin' && $password === '123456789') {
        echo json_encode([
            "success" => true,
            "message" => "Login successful"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Invalid credentials"
        ]);
    }
    exit;
}

// For other admin operations
echo json_encode([
    "success" => false,
    "error" => "Invalid admin request"
]);
?>