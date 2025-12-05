<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

require_once __DIR__ . '/../../config/db.php';
global $pdo;

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $order_id = $data['order_id'] ?? null;

    if (!$order_id) {
        echo json_encode(['success'=>false,'message'=>'Thiếu order_id']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, status FROM orders WHERE id=?");
    $stmt->execute([$order_id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$order){
        echo json_encode(['success'=>false,'message'=>'Đơn hàng không tồn tại']);
        exit;
    }

    if($order['status'] !== 'pending'){
        echo json_encode(['success'=>false,'message'=>'Chỉ đơn chờ xác nhận mới xác nhận được']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE orders SET status='confirmed' WHERE id=?");
    $stmt->execute([$order_id]);

    echo json_encode(['success'=>true,'message'=>'Đơn hàng đã được xác nhận']);
}
?>
