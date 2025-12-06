<?php
// backend/api/admin/contacts.php

// 1. CORS Headers & Preflight Handling
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
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle Preflight immediately
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
    $method = $_SERVER['REQUEST_METHOD'];

    // --- GET ---
    if ($method === 'GET') {
        if (isset($_GET['action']) && $_GET['action'] == 'view' && isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("UPDATE contact_messages SET status = 'read' WHERE id = :id AND status = 'unread'");
            $stmt->execute([':id' => $id]);

            $stmt = $pdo->prepare("SELECT * FROM contact_messages WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $msg = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($msg) {
                $response['success'] = true;
                $response['data'] = $msg;
            } else {
                throw new Exception("Tin nhắn không tồn tại");
            }
        } else {
            $sql = "SELECT * FROM contact_messages ORDER BY CASE WHEN status = 'unread' THEN 0 ELSE 1 END, created_at DESC";
            $stmt = $pdo->query($sql);
            $response['success'] = true;
            $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }

    // --- POST ---
    if ($method === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $action = $_GET['action'] ?? $input['action'] ?? '';
        $id = $_GET['id'] ?? $input['id'] ?? 0;

        if ($action == 'status') {
            $val = $_GET['val'] ?? $input['val'] ?? 'read';
            $stmt = $pdo->prepare("UPDATE contact_messages SET status = :s WHERE id = :i");
            $stmt->execute([':s' => $val, ':i' => $id]);
            $response['success'] = true;
            $response['message'] = 'Cập nhật trạng thái thành công';
        }
        elseif ($action == 'delete') {
            $stmt = $pdo->prepare("DELETE FROM contact_messages WHERE id = :i");
            $stmt->execute([':i' => $id]);
            $response['success'] = true;
            $response['message'] = 'Đã xóa tin nhắn';
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = $e->getMessage();
}

echo json_encode($response);