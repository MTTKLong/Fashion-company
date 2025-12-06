<?php
// Update these values
$DB_HOST = '127.0.0.1';
$DB_PORT = '3306'; // XAMPP MySQL runs on port 3307
$DB_NAME = 'fashion_company';
$DB_USER = 'root';
$DB_PASS = ''; // Empty password

$portsToTry = array_values(array_unique([$DB_PORT, '3306', '3307']));
$lastEx = null;
$pdo = null;

foreach ($portsToTry as $port) {
    try {
        $pdo = new PDO(
            "mysql:host={$DB_HOST};port={$port};dbname={$DB_NAME};charset=utf8mb4",
            $DB_USER,
            $DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        // connected successfully using $port
        break;
    } catch (Exception $e) {
        $lastEx = $e;
    }
}

if (!$pdo) {
    http_response_code(500);
    echo json_encode([
        'error' => 'DB connection failed: ' . ($lastEx ? $lastEx->getMessage() : 'unknown'),
        'host' => $DB_HOST,
        'tried_ports' => $portsToTry,
        'db_name' => $DB_NAME,
        'db_user' => $DB_USER,
        'hint' => 'Start MySQL in XAMPP and confirm the port in the XAMPP Control Panel or C:\\xampp\\mysql\\bin\\my.ini'
    ]);
    exit;
}
