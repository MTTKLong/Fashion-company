<?php
// backend/config/db.php

// --- DOCKER CONFIGURATION (Local Linux) ---
$DB_HOST = 'db';              // Service name from docker-compose.yml
$DB_PORT = '3306';            // Internal Docker port (NOT 3307)
$DB_NAME = 'fashion_company';
$DB_USER = 'root';
$DB_PASS = '';                // Empty because MYSQL_ALLOW_EMPTY_PASSWORD: "yes"

$pdo = null;

try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed',
        'debug' => $e->getMessage(), 
        'hint'  => 'Host should be "db", Port "3306", Password empty.'
    ]);
    exit;
}
?>