<?php
// backend/api/settings.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/db.php';

$query = "SELECT setting_key, setting_value FROM site_settings";

try {
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    $settings = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    echo json_encode($settings);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error loading settings.",
        "debug_error" => $e->getMessage() 
    ]);
}
?>