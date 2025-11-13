<?php
// Update these values
$DB_HOST = '127.0.0.1';
$DB_NAME = 'fashion_company';
$DB_USER = 'root';
$DB_PASS = '';

try {
    $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error'=>'DB connection failed: '.$e->getMessage()]);
    exit;
}
