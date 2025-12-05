<?php
require_once __DIR__ . '/../config/db.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
        $cats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $cats]);
    }

    if ($method === 'POST') {
    // Chỉ admin mới được thêm
    $headers = getallheaders();
    if (!isset($headers['Authorization']) || $headers['Authorization'] !== 'admin') {
        http_response_code(401);
        echo json_encode(['success'=>false, 'message'=>'Unauthorized']);
        exit;
    }

    $name = trim($_POST['name'] ?? '');
    $slug = trim($_POST['slug'] ?? '');

    if (!$name) throw new Exception("Tên danh mục không được rỗng");
    if (!$slug) throw new Exception("Slug không được rỗng");

    // Kiểm tra trùng
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE name=? OR slug=?");
    $stmt->execute([$name, $slug]);
    if ($stmt->fetch()) throw new Exception("Danh mục đã tồn tại");

    // Thêm mới
    $stmt = $pdo->prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
    $stmt->execute([$name, $slug]);

    echo json_encode([
        'success'=>true,
        'data'=>[
            'id'=>$pdo->lastInsertId(),
            'name'=>$name,
            'slug'=>$slug
        ]
    ]);
}

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
