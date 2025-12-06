<?php
// backend/api/get-order-detail.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/db.php';
global $pdo;

$order_id = $_GET['order_id'] ?? null;
if (!$order_id) { echo json_encode(["success"=>false,"message"=>"Thiếu order ID"]); exit; }

try {
    // Lấy thông tin đơn
    $stmt = $pdo->prepare("SELECT * FROM orders WHERE id=?");
    $stmt->execute([$order_id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        echo json_encode(["success"=>false,"message"=>"Không tìm thấy đơn hàng"]);
        exit;
    }

    // Lấy chi tiết sản phẩm trong đơn
    $stmt_items = $pdo->prepare("
        SELECT p.name, p.image, oi.quantity, oi.price 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id=?
    ");
    $stmt_items->execute([$order_id]);
    $order['items'] = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success"=>true, "order"=>$order]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
