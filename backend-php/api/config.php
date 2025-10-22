<?php
// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
// FOR LOCAL TESTING:
define('DB_HOST', 'localhost');
define('DB_USER', 'root');           // XAMPP default
define('DB_PASS', '');               // XAMPP default (empty)
define('DB_NAME', 'blog_local');     // Create this in XAMPP phpMyAdmin

// FOR PRODUCTION (when ready to deploy):
// define('DB_HOST', 'localhost');
// define('DB_USER', 'spaceprobe_user');
// define('DB_PASS', 'your_hostinger_password');
// define('DB_NAME', 'spaceprobe_blog');

function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Database connection failed',
            'message' => $conn->connect_error
        ]);
        exit();
    }
    
    $conn->set_charset("utf8mb4");
    return $conn;
}

// Helper function to send JSON response
function sendJSON($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}
?>