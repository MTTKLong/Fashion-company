<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db.php'; // PDO $pdo

$user_id = $_GET['user_id'] ?? null;
if (!$user_id) {
    echo json_encode([]);
    exit;
}

try {
    // Lấy giỏ hàng PENDING của user
    $stmt = $pdo->prepare("SELECT id FROM carts WHERE user_id=? AND status='pending'");
    $stmt->execute([$user_id]);
    $cart = $stmt->fetch();

    if (!$cart) {
        echo json_encode([]); // Chưa có giỏ hàng
        exit;
    }

    $cart_id = $cart['id'];

    // Lấy sản phẩm trong cart_items
    $stmt = $pdo->prepare("
        SELECT ci.id as cart_item_id, ci.quantity, p.id as product_id, p.name as product_name, p.price, p.image as product_image
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = ?
    ");
    $stmt->execute([$cart_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($items);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
