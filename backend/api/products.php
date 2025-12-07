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

// Kiểm tra admin
function isAdmin() {
    $headers = getallheaders();
    return isset($headers['Authorization']) && $headers['Authorization'] === 'admin';
}

// Tạo slug
function generateSlug($str) {
    $str = strtolower(trim($str));
    $str = preg_replace('/[^a-z0-9]+/', '-', $str);
    return trim($str, '-');
}

// Upload rồi chuyển ảnh thành blob
function convertImageToBlob($file) {
    $ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    if (!in_array($ext, $allowed)) {
        throw new Exception("Chỉ chấp nhận file ảnh JPG, PNG, WEBP, GIF");
    }

    if ($file["size"] > 5000000) {
        throw new Exception("File ảnh quá lớn (tối đa 5MB)");
    }

    return file_get_contents($file["tmp_name"]);
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {

        /* --------------------------------------
         * LẤY DANH SÁCH SẢN PHẨM
         * -------------------------------------- */
        case 'GET':
            $isAdmin = isAdmin();

            if (isset($_GET['id'])) {
                // Lấy chi tiết 1 sản phẩm
                $sql = $isAdmin 
                    ? "SELECT * FROM products WHERE id=?" 
                    : "SELECT * FROM products WHERE id=? AND status=1";
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$_GET['id']]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($product) {
                    if ($product['image']) {
                        $product['image'] = "data:image/jpeg;base64," . base64_encode($product['image']);
                    }
                    unset($product['image']);

                    echo json_encode(['success' => true, 'data' => $product]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Không tìm thấy sản phẩm']);
                }
                exit;
            }

            // LIST sản phẩm
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;

            $offset = ($page - 1) * $limit;

            $search = $_GET['search'] ?? '';
            $category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;

            $conditions = [];
            $params = [];

            if (!$isAdmin) {
                $conditions[] = "status = 1";
            }

            if ($search) {
                $conditions[] = "(name LIKE ? OR description LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }

            if ($category_id) {
                $conditions[] = "category_id = ?";
                $params[] = $category_id;
            }

            $where = $conditions ? "WHERE " . implode(" AND ", $conditions) : "";

            // Đếm tổng
            $countStmt = $pdo->prepare("SELECT COUNT(*) FROM products $where");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();

            // Lấy danh sách
            $sql = "SELECT id, name, price, description, status, slug, image 
                    FROM products $where 
                    ORDER BY created_at DESC 
                    LIMIT $limit OFFSET $offset";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Convert blob sang base64
            foreach ($products as &$p) {
    if (!empty($p['image'])) {
        $p['image'] = "data:image/jpeg;base64," . base64_encode($p['image']);
    } else {
        $p['image'] = null; // hoặc URL placeholder
    }
}

            echo json_encode([
                'success' => true,
                'data' => $products,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => intval($total),
                    'totalPages' => ceil($total / $limit)
                ]
            ]);
            break;


        /* --------------------------------------
         * THÊM HOẶC UPDATE SẢN PHẨM
         * -------------------------------------- */
        case 'POST':
            if (!isAdmin()) {
                http_response_code(401);
                echo json_encode(['success'=>false,'message'=>'Unauthorized']);
                exit;
            }

            $isUpdate = isset($_POST['_method']) && $_POST['_method']==='PUT';
            $id = $isUpdate ? intval($_GET['id'] ?? 0) : null;

            $name = trim($_POST['name']);
            $description = trim($_POST['description']);
            $price = floatval($_POST['price']);
            $stock = intval($_POST['stock']);
            $category_id = intval($_POST['category_id']);
            $status = isset($_POST['status']) ? (int)$_POST['status'] : 0;

            if (!$name || $price <= 0) {
                throw new Exception("Tên và giá sản phẩm bắt buộc");
            }

            $slug = generateSlug($name);
            $blob = null;

            if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
                $blob = convertImageToBlob($_FILES['image']);
            }

            if ($isUpdate) {
                $sql = "UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?, status=?, slug=?";
                $params = [$name,$description,$price,$stock,$category_id,$status,$slug];

                if ($blob) {
                    $sql .= ", image=?";
                    $params[] = $blob;
                }

                $sql .= " WHERE id=?";
                $params[] = $id;

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);

                echo json_encode(['success'=>true,'message'=>"Cập nhật sản phẩm thành công"]);
            } 
            else {
                $stmt = $pdo->prepare("
                    INSERT INTO products (name, description, price, stock, category_id, status, slug, image, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ");

                $stmt->execute([
                    $name, $description, $price, $stock, 
                    $category_id, $status, $slug, $blob
                ]);

                echo json_encode(['success'=>true,'message'=>"Thêm sản phẩm thành công"]);
            }
            break;


        /* --------------------------------------
         * XÓA SẢN PHẨM
         * -------------------------------------- */
        case 'DELETE':
            if (!isAdmin()) {
                http_response_code(401);
                echo json_encode(['success'=>false,'message'=>'Unauthorized']);
                exit;
            }

            $id = intval($_GET['id']);
            if ($id <= 0) throw new Exception("ID không hợp lệ");

            $stmt = $pdo->prepare("DELETE FROM products WHERE id=?");
            $stmt->execute([$id]);

            echo json_encode(['success'=>true,'message'=>"Đã xoá sản phẩm"]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success'=>false,'message'=>'Method Not Allowed']);
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
