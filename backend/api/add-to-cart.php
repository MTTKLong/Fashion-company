<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id    = isset($data['user_id']) ? intval($data['user_id']) : 0;
$product_id = isset($data['product_id']) ? intval($data['product_id']) : 0;
$quantity   = isset($data['quantity']) ? intval($data['quantity']) : 1;

if ($user_id <= 0 || $product_id <= 0) {
    echo json_encode(["success" => false, "message" => "Thiếu hoặc sai user_id/product_id"]);
    exit;
}

try {
    // 1. Lấy giỏ hàng PENDING hiện tại
    $stmt = $pdo->prepare("SELECT id FROM carts WHERE user_id=? AND status='pending'");
    $stmt->execute([$user_id]);
    $cart = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cart) {
        $cart_id = $cart['id'];
    } else {
        // Tạo giỏ hàng mới
        $stmt = $pdo->prepare("INSERT INTO carts(user_id, status, created_at) VALUES(?, 'pending', NOW())");
        $stmt->execute([$user_id]);
        $cart_id = $pdo->lastInsertId();
    }

    // 2. Kiểm tra sản phẩm trong giỏ
    $stmt = $pdo->prepare("SELECT id, quantity FROM cart_items WHERE cart_id=? AND product_id=?");
    $stmt->execute([$cart_id, $product_id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($item) {
        // Cập nhật số lượng
        $newQty = $item['quantity'] + $quantity;
        $update = $pdo->prepare("UPDATE cart_items SET quantity=? WHERE id=?");
        $update->execute([$newQty, $item['id']]);
    } else {
        // Thêm sản phẩm mới
        $insert = $pdo->prepare("INSERT INTO cart_items(cart_id, product_id, quantity) VALUES(?, ?, ?)");
        $insert->execute([$cart_id, $product_id, $quantity]);
    }

    echo json_encode([
        "success" => true,
        "cart_id" => $cart_id,
        "message" => "Đã thêm vào giỏ hàng"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Lỗi SQL: " . $e->getMessage()
    ]);
}
?>
