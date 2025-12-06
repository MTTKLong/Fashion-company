<?php
// backend/api/get-orders.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../config/db.php';
global $pdo;

$user_id = $_GET['user_id'] ?? null;
if (!$user_id) { 
    echo json_encode(["success"=>false,"message"=>"Thiếu user ID"]); 
    exit; 
}

try {
    $stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Lấy chi tiết items cho mỗi đơn
    foreach ($orders as &$order) {
        $stmt_items = $pdo->prepare("
            SELECT p.name, p.image, oi.quantity, oi.price 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id=?
        ");
        $stmt_items->execute([$order['id']]);
        $items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

        // Chuyển BLOB sang Base64
        foreach ($items as &$item) {
            if (!empty($item['image'])) {
                $item['image'] = 'data:image/webp;base64,' . base64_encode($item['image']);
            }
        }

        $order['items'] = $items;
    }

    echo json_encode(["success"=>true,"orders"=>$orders]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
?>
