<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . '/../config/db.php';
global $pdo;

$data = json_decode(file_get_contents('php://input'), true);
$user_id = $data['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Thiếu user_id"]);
    exit;
}

try {
    // 1. Lấy giỏ hàng pending
    $stmt = $pdo->prepare("SELECT id FROM carts WHERE user_id=? AND status='pending'");
    $stmt->execute([$user_id]);
    $cart = $stmt->fetch();

    if (!$cart) {
        echo json_encode(["success" => false, "message" => "Giỏ hàng trống"]);
        exit;
    }

    $cart_id = $cart['id'];

    // 2. Lấy items và giá từ products
    $stmt = $pdo->prepare("
        SELECT ci.product_id, ci.quantity, p.price
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = ?
    ");
    $stmt->execute([$cart_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$items) {
        echo json_encode(["success" => false, "message" => "Giỏ hàng trống"]);
        exit;
    }

    // 3. Tính tổng
    $total = 0;
    foreach ($items as $item) {
        $total += $item['price'] * $item['quantity'];
    }

    // 4. Tạo order
    $stmt = $pdo->prepare("INSERT INTO orders(user_id, total, status, created_at) VALUES (?, ?, 'pending', NOW())");
    $stmt->execute([$user_id, $total]);
    $order_id = $pdo->lastInsertId();

    // 5. Chèn order_items
    $stmt = $pdo->prepare("INSERT INTO order_items(order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($items as $item) {
        $stmt->execute([$order_id, $item['product_id'], $item['quantity'], $item['price']]);
    }

    // 6. Xóa cart cũ
    $pdo->prepare("DELETE FROM cart_items WHERE cart_id=?")->execute([$cart_id]);
    $pdo->prepare("DELETE FROM carts WHERE id=?")->execute([$cart_id]);

    echo json_encode(["success" => true, "message" => "Thanh toán thành công"]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
