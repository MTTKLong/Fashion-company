<?php
// Đường dẫn dựa trên __DIR__ (Thư mục hiện tại của file products.php)
require_once __DIR__ . '/../includes/session.php'; 
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';

startSecureSession();
requireAdmin();
global $pdo;

// --- 1. Xử lý Phân trang & Tìm kiếm ---
$limit = DEFAULT_PAGE_SIZE; // Từ config.php
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$offset = ($page - 1) * $limit;
$search = trim($_GET['search'] ?? '');

$where_clause = '';
$params = [];
if (!empty($search)) {
    $where_clause = " WHERE p.name LIKE ?";
    $params[] = "%" . $search . "%";
}

try {
    // 2. Lấy tổng số bản ghi
    $sql_count = "SELECT COUNT(id) AS total FROM products p" . $where_clause;
    $stmt_count = $pdo->prepare($sql_count);
    $stmt_count->execute($params);
    $total_rows = $stmt_count->fetchColumn();
    $total_pages = ceil($total_rows / $limit);

    // 3. Lấy dữ liệu sản phẩm
    $sql = "SELECT p.*, c.name as category_name FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            " . $where_clause . " ORDER BY p.id DESC LIMIT ? OFFSET ?";
    
    // Thêm LIMIT và OFFSET vào params
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    $_SESSION['error'] = "Lỗi CSDL: " . $e->getMessage();
    $products = [];
    $total_rows = 0;
    $total_pages = 1;
}

// --- Hiển thị Giao diện Admin (Sử dụng Tabler) ---
echo adminHeader('Quản lý Sản phẩm'); // Bắt đầu HTML và Header

?>

<div class="page-header d-print-none">
    <div class="row align-items-center">
        <div class="col">
            <h2 class="page-title">Quản lý Sản phẩm</h2>
        </div>
        <div class="col-auto ms-auto d-print-none">
            <div class="btn-list">
                <a href="product-add.php" class="btn btn-primary d-none d-sm-inline-block">
                    Thêm Sản phẩm mới
                </a>
            </div>
        </div>
    </div>
</div>

<?php 
if (isset($_SESSION['success'])) { echo showSuccess($_SESSION['success']); unset($_SESSION['success']); }
if (isset($_SESSION['error'])) { echo showError($_SESSION['error']); unset($_SESSION['error']); }
?>

<div class="card">
    <div class="card-header">
        <form action="products.php" method="GET" class="d-flex">
            <input type="text" name="search" class="form-control me-2" placeholder="Tìm kiếm theo tên sản phẩm..." value="<?= htmlspecialchars($search); ?>">
            <button class="btn btn-secondary" type="submit">Tìm</button>
            <?php if (!empty($search)): ?>
                <a href="products.php" class="btn btn-link ms-2">Xóa tìm kiếm</a>
            <?php endif; ?>
        </form>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table card-table table-vcenter text-nowrap datatable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ảnh</th>
                        <th>Tên Sản phẩm</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Danh mục</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (count($products) > 0): ?>
                        <?php foreach($products as $row): ?>
                        <tr>
                            <td><?= $row['id']; ?></td>
                            <td><img src="../../<?= htmlspecialchars($row['image']); ?>" alt="<?= htmlspecialchars($row['name']); ?>" style="width: 50px; height: 50px; object-fit: cover;"></td>
                            <td><?= htmlspecialchars($row['name']); ?></td>
                            <td><?= number_format($row['price'], 0, ',', '.'); ?> VNĐ</td>
                            <td><?= $row['stock']; ?></td>
                            <td><?= htmlspecialchars($row['category_name'] ?? 'N/A'); ?></td>
                            <td class="text-end">
                                <a href="product-edit.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-icon btn-outline-primary" title="Sửa">
                                    </a>
                                <form method="POST" action="../api/product.php?action=delete" style="display:inline-block;" onsubmit="return confirm('Bạn có chắc chắn muốn xóa sản phẩm này?');">
                                    <input type="hidden" name="product_id" value="<?= $row['id']; ?>">
                                    <input type="hidden" name="csrf_token" value="<?= generateCSRFToken(); ?>"> 
                                    <button type="submit" class="btn btn-sm btn-icon btn-outline-danger" title="Xóa">
                                        </button>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr><td colspan="7" class="text-center">Không tìm thấy sản phẩm nào.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
    <div class="card-footer d-flex align-items-center">
        <p class="m-0 text-muted">Hiển thị <?= count($products); ?> trên tổng số <?= $total_rows; ?> sản phẩm</p>
        <ul class="pagination m-0 ms-auto">
            <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                <li class="page-item <?= ($i == $page) ? 'active' : ''; ?>">
                    <a class="page-link" href="?page=<?= $i; ?><?= !empty($search) ? '&search=' . urlencode($search) : ''; ?>"><?= $i; ?></a>
                </li>
            <?php endfor; ?>
        </ul>
    </div>
</div>

<?php 
echo adminFooter(); // Kết thúc HTML và Footer
?>