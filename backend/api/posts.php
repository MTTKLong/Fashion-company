<?php
// Public Posts API (no admin auth) with CORS support for local dev
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost',
];

if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    }
}

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ .'/../includes/validation.php';

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json; charset=utf-8');

try {
    if ($method === 'GET') {
        // If id provided, return single post
        if (isset($_GET['id']) && $_GET['id'] !== '') {
            $id = $_GET['id'];
            // support numeric id or slug
            if (ctype_digit((string)$id)) {
                $stmt = $pdo->prepare('SELECT * FROM posts WHERE id = :id LIMIT 1');
                $stmt->execute([':id' => (int)$id]);
            } else {
                $stmt = $pdo->prepare('SELECT * FROM posts WHERE slug = :slug LIMIT 1');
                $stmt->execute([':slug' => $id]);
            }
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Post not found']);
                exit;
            }

            echo json_encode(['success' => true, 'data' => $row]);
            exit;
        }

        // list with pagination & optional search
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
        $offset = ($page - 1) * $limit;
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';

        $where = [];
        $params = [];
        if ($search !== '') {
            $where[] = '(title LIKE :q OR content LIKE :q)';
            $params[':q'] = "%{$search}%";
        }

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM posts {$whereSql}");
        $totalStmt->execute($params);
        $total = (int)$totalStmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT * FROM posts {$whereSql} ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v, PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => max(1, (int)ceil($total / $limit))
            ]
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
