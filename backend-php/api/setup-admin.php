<?php
// ⚠️ RUN THIS ONCE TO CREATE ADMIN, THEN DELETE THIS FILE!
require_once 'config.php';

$username = "admin";  // CHANGE THIS
$password = "SpaceProbe2024!";  // CHANGE THIS

$conn = getDBConnection();
$password_hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)");
$stmt->bind_param("ss", $username, $password_hash);

if ($stmt->execute()) {
    echo "<h2>✅ Admin User Created!</h2>";
    echo "<p><strong>Username:</strong> $username</p>";
    echo "<p><strong>Password:</strong> $password</p>";
    echo "<p style='color: red;'><strong>⚠️ DELETE THIS FILE NOW!</strong></p>";
} else {
    echo "<h2>❌ Error</h2>";
    echo "<p>" . $stmt->error . "</p>";
}

$conn->close();
?>