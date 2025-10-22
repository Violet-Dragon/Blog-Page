<?php
session_start();
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Login
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'];
    $password = $data['password'];
    
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT id, password_hash FROM admin_users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        if (password_verify($password, $user['password_hash'])) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_id'] = $user['id'];
            $_SESSION['username'] = $username;
            sendJSON(['success' => true, 'message' => 'Login successful']);
        } else {
            sendJSON(['error' => 'Invalid credentials'], 401);
        }
    } else {
        sendJSON(['error' => 'Invalid credentials'], 401);
    }
    
    $conn->close();
    
} else if ($method === 'GET') {
    // Check authentication
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in']) {
        sendJSON([
            'authenticated' => true,
            'username' => $_SESSION['username']
        ]);
    } else {
        sendJSON(['authenticated' => false], 401);
    }
    
} else if ($method === 'DELETE') {
    // Logout
    session_destroy();
    sendJSON(['success' => true, 'message' => 'Logged out successfully']);
}
?>