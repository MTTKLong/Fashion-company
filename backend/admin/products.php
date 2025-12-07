<?php
require_once __DIR__ . '/../includes/session.php'; 
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';

startSecureSession();
requireAdmin();
global $pdo;

$limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$offset = ($page - 1) * $limit;
$search = trim($_GET['search'] ?? '');
$category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;

$categories = $pdo->query("SELECT id, name FROM categories ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);

$where = " WHERE 1 ";
$params = [];

if (!empty($search)) {
    $where .= " AND p.name LIKE ? ";
    $params[] = "%$search%";
}

if ($category_id > 0) {
    $where .= " AND p.category_id = ? ";
    $params[] = $category_id;
}

try {
    $stmt_count = $pdo->prepare("SELECT COUNT(id) FROM products p $where");
    $stmt_count->execute($params);
    $total_rows = $stmt_count->fetchColumn();
    $total_pages = ceil($total_rows / $limit);

    $sql = "SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            $where 
            ORDER BY p.id DESC 
            LIMIT ? OFFSET ?";

    $params2 = $params;
    $params2[] = $limit;
    $params2[] = $offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params2);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    $_SESSION['error'] = "Lỗi CSDL: " . $e->getMessage();
    $products = [];
}

echo adminHeader('Quản lý Sản phẩm');
?>

<div class="page-header d-print-none">
    <div class="row align-items-center">
        <div class="col">
            <h2 class="page-title">Quản lý Sản phẩm</h2>
        </div>
        <div class="col-auto ms-auto">
            <a href="product-add.php" class="btn btn-primary">Thêm Sản phẩm mới</a>
        </div>
    </div>
</div>

<?= showNotify(); ?>

<div class="card">
    <div class="card-header">
        <form action="products.php" method="GET" class="d-flex flex-wrap gap-2">
            
            <select name="category_id" class="form-select" onchange="this.form.submit()">
                <option value="0">Tất cả danh mục</option>
                <?php foreach ($categories as $cat): ?>
                    <option value="<?= $cat['id']; ?>" <?= ($cat['id'] == $category_id ? 'selected' : '') ?>>
                        <?= htmlspecialchars($cat['name']); ?>
                    </option>
                <?php endforeach; ?>
            </select>

            <select name="limit" class="form-select" onchange="this.form.submit()">
                <?php foreach ([5,10,20,30,50] as $l): ?>
                    <option value="<?= $l ?>" <?= $limit == $l ? 'selected' : '' ?>><?= $l ?>/trang</option>
                <?php endforeach; ?>
            </select>

            <input type="text" name="search" class="form-control" placeholder="Tìm kiếm..." value="<?= htmlspecialchars($search); ?>">
            <button class="btn btn-secondary" type="submit">Tìm</button>

            <?php if (!empty($search) || $category_id > 0): ?>
                <a href="products.php" class="btn btn-link ms-2">Xóa lọc</a>
            <?php endif; ?>
        </form>
    </div>

    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-vcenter card-table">
                <thead><tr>
                    <th>ID</th><th>Ảnh</th><th>Tên</th><th>Giá</th><th>Tồn</th><th>Danh mục</th><th>Trạng thái</th><th></th>
                </tr></thead>
                <tbody>
                <?php if (!empty($products)): foreach ($products as $p): ?>
                    <tr>
                        <td><?= $p['id']; ?></td>
                        <td>
                            <?php if (!empty($p['image'])): ?>
                                <img src="data:image/jpeg;base64,<?= base64_encode($p['image']); ?>" style="width:50px;height:50px;object-fit:cover">
                            <?php else: ?>
                                <span class="text-muted">Không ảnh</span>
                            <?php endif; ?>
                        </td>
                        <td><?= htmlspecialchars($p['name']); ?></td>
                        <td><?= number_format($p['price'], 0, ',', '.'); ?>₫</td>
                        <td><?= $p['stock']; ?></td>
                        <td><?= htmlspecialchars($p['category_name'] ?? 'N/A'); ?></td>
                        <td><?= $p['status'] ? "<span class='text-green'>Hiển thị</span>" : "<span class='text-red'>Ẩn</span>" ?></td>
                        <td class="text-end">
                            <a href="product-edit.php?id=<?= $p['id']; ?>" class="btn btn-sm btn-outline-primary">Sửa</a>
                        </td>
                    </tr>
                <?php endforeach; else: ?>
                    <tr><td colspan="8" class="text-center text-muted">Không tìm thấy sản phẩm.</td></tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <div class="card-footer d-flex align-items-center">
        <p class="m-0">Hiển thị <?= count($products); ?> / <?= $total_rows; ?> sản phẩm</p>
        <ul class="pagination m-0 ms-auto">
            <?php for ($i=1; $i <= $total_pages; $i++): ?>
                <li class="page-item <?= $i == $page ? 'active' : '' ?>">
                    <a class="page-link" 
                        href="?page=<?= $i ?>&limit=<?= $limit ?>&category_id=<?= $category_id ?><?= !empty($search) ? '&search='.urlencode($search) : '' ?>">
                        <?= $i ?>
                    </a>
                </li>
            <?php endfor; ?>
        </ul>
    </div>
</div>

<?php echo adminFooter(); ?>
