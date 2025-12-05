<?php
// backend/config/db.php

// In Docker, we talk to the service name "db", not localhost
$DB_HOST = 'db';      // Docker internal name
$DB_PORT = '3306';    // Docker internal port
$DB_NAME = 'fashion_company';
$DB_USER = 'root';    // Matches XAMPP
$DB_PASS = '';        // Matches XAMPP

try {
    $pdo = new PDO("mysql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error'=>'DB connection failed: '.$e->getMessage()]);
    exit;
}
?>