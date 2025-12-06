<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../config/db.php';
global $pdo;

$data = json_decode(file_get_contents("php://input"), true);
$cart_item_id = $data['id'] ?? null;

if (!$cart_item_id) {
    echo json_encode(["success"=>false,"message"=>"Thiếu id sản phẩm trong giỏ"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM cart_items WHERE id=?");
    $stmt->execute([$cart_item_id]);
    echo json_encode(["success"=>true,"message"=>"Xóa thành công"]);
} catch(PDOException $e){
    http_response_code(500);
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
?>
