<?php
// backend/api/admin/settings.php

// 1. CORS Headers & Preflight
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:5173', 
    'http://localhost:3000',
    'http://127.0.0.1:5173'
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Load Session & DB
require_once '../../includes/session.php';
require_once '../../config/db.php';

// 3. Security Checks
startSecureSession();
requireAdmin();

$response = ['success' => false, 'message' => '', 'data' => null];

try {
    // --- GET ---
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $settings = [];
        $stmt = $pdo->query("SELECT * FROM site_settings");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        $response['success'] = true;
        $response['data'] = $settings;
    }

    // --- POST ---
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_POST['settings'])) {
            $sql = "INSERT INTO site_settings (setting_key, setting_value) VALUES (:key, :value) 
                    ON DUPLICATE KEY UPDATE setting_value = :value";
            $stmt = $pdo->prepare($sql);

            foreach ($_POST['settings'] as $key => $value) {
                $clean = htmlspecialchars(strip_tags($value));
                $stmt->execute([':key' => $key, ':value' => $clean]);
            }
        }

        if (isset($_FILES['site_logo']) && $_FILES['site_logo']['error'] == 0) {
            $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            $filename = $_FILES['site_logo']['name'];
            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

            if (in_array($ext, $allowed)) {
                $new_filename = "site_logo." . $ext;
                $target_dir = "../../uploads/";
                
                if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);
                
                $files = glob($target_dir . "site_logo.*");
                foreach ($files as $file) {
                    if (is_file($file)) unlink($file);
                }

                if (move_uploaded_file($_FILES['site_logo']['tmp_name'], $target_dir . $new_filename)) {
                    $stmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES ('site_logo', :v) ON DUPLICATE KEY UPDATE setting_value = :v");
                    $stmt->execute([':v' => $new_filename]);
                    $response['logo'] = $new_filename;
                } else {
                    throw new Exception("Lỗi lưu file");
                }
            } else {
                throw new Exception("File không hợp lệ");
            }
        }

        $response['success'] = true;
        $response['message'] = "Cập nhật thành công";
    }

} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = $e->getMessage();
}

echo json_encode($response);