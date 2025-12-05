<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';
global $pdo;

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    echo json_encode([
        'success' => false,
        'message' => 'Phương thức không hợp lệ'
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$order_id = $data['order_id'] ?? null;
$action   = $data['action'] ?? null;
$user_id  = $_SESSION['user_id'] ?? null;
$role     = $_SESSION['role'] ?? 'user';

if (!$order_id || !$action) {
    echo json_encode([
        'success' => false,
        'message' => 'Thiếu thông tin cần thiết'
    ]);
    exit;
}

// Lấy đơn hàng
$stmt = $pdo->prepare("SELECT id, status, user_id FROM orders WHERE id=?");
$stmt->execute([$order_id]);
$order = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {
    echo json_encode([
        'success' => false,
        'message' => 'Đơn hàng không tồn tại'
    ]);
    exit;
}

$current_status = $order['status'];

/**
 * ===============================
 *   XỬ LÝ ADMIN XÁC NHẬN ĐƠN
 * ===============================
 */
if ($action === 'confirm') {

    if ($current_status !== 'pending') {
        echo json_encode([
            'success' => false,
            'message' => 'Chỉ xác nhận đơn ở trạng thái chờ xác nhận'
        ]);
        exit;
    }

    if ($role !== 'admin') {
        echo json_encode([
            'success' => false,
            'message' => 'Bạn không có quyền xác nhận đơn'
        ]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE orders SET status='confirmed' WHERE id=?");
    $stmt->execute([$order_id]);

    echo json_encode([
        'success' => true,
        'message' => 'Đơn hàng đã được xác nhận',
        'new_status' => 'confirmed'
    ]);
    exit;
}

/**
 * ===============================
 *        XỬ LÝ HỦY ĐƠN
 * ===============================
 */
if ($action === 'cancel') {

    // Đơn đã hủy rồi
    if ($current_status === 'canceled') {
        echo json_encode([
            'success' => true,
            'message' => 'Đơn hàng đã hủy trước đó',
            'new_status' => 'canceled'
        ]);
        exit;
    }

    // USER
    if ($role === 'user') {

        // User chỉ hủy đơn của chính họ
        if ($order['user_id'] != $user_id) {
            echo json_encode([
                'success' => false,
                'message' => 'Bạn không thể hủy đơn không thuộc sở hữu'
            ]);
            exit;
        }

        // User chỉ hủy pending
        if ($current_status !== 'pending') {
            echo json_encode([
                'success' => false,
                'message' => 'Chỉ có thể hủy đơn đang chờ xác nhận'
            ]);
            exit;
        }
    }

    // ADMIN: được hủy mọi trạng thái
    $stmt = $pdo->prepare("UPDATE orders SET status='canceled' WHERE id=?");
    $stmt->execute([$order_id]);

    echo json_encode([
        'success' => true,
        'message' => 'Đơn hàng đã được hủy',
        'new_status' => 'canceled'
    ]);
    exit;
}

echo json_encode([
    'success' => false,
    'message' => 'Hành động không hợp lệ'
]);
exit;
