<?php
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../config/db.php';
require_once 'helpers.php';

startSecureSession();
requireAdmin();
global $pdo;

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $price = (float)$_POST['price'];
    $stock = (int)$_POST['stock'];
    $category_id = (int)$_POST['category_id'];
    $description = $_POST['description'];
    $status = isset($_POST['status']) ? 1 : 0;

    // Validate
    if (!$name || $price <= 0 || $stock < 0) {
        $error = "Tên, giá và tồn kho là bắt buộc";
    }

    // Upload ảnh BLOB
    $imageBlob = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, $allowed)) {
            $error = "File ảnh không hợp lệ";
        } elseif ($_FILES['image']['size'] > 5 * 1024 * 1024) {
            $error = "Ảnh quá lớn (Max 5MB)";
        } else {
            $imageBlob = file_get_contents($_FILES['image']['tmp_name']);
        }
    }

    if (empty($error)) {
        try {
            $slug = make_slug($name);

            $stmt = $pdo->prepare("
                INSERT INTO products (name, slug, category_id, price, stock, description, image, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $name, $slug, $category_id, $price, $stock, 
                $description, $imageBlob, $status
            ]);

            $_SESSION['success'] = "Thêm sản phẩm thành công!";
            header('Location: products.php');
            exit;

        } catch (Exception $e) {
            $error = "Lỗi: " . $e->getMessage();
        }
    }
}

$cats = $pdo->query("SELECT * FROM categories")->fetchAll();

echo adminHeader('Thêm Sản phẩm');
?>
<div class="page-header"><h2 class="page-title">Thêm Sản phẩm</h2></div>
<div class="card">
    <div class="card-body">
        <?php if($error) echo showError($error); ?>
        <form method="POST" enctype="multipart/form-data">

            <div class="mb-3">
                <label class="form-label">Tên sản phẩm</label>
                <input type="text" name="name" class="form-control" required>
            </div>

            <div class="row">
                <div class="col-md-4 mb-3">
                    <label class="form-label">Giá (VNĐ)</label>
                    <input type="number" name="price" class="form-control" required>
                </div>

                <div class="col-md-4 mb-3">
                    <label class="form-label">Tồn kho</label>
                    <input type="number" name="stock" class="form-control" required>
                </div>

                <div class="col-md-4 mb-3">
                    <label class="form-label">Danh mục</label>
                    <select name="category_id" class="form-select" required>
                        <option value="">-- Chọn danh mục --</option>
                        <?php foreach($cats as $c): ?>
                            <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label">Hình ảnh</label>
                <input type="file" name="image" class="form-control" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea name="description" class="form-control" rows="5"></textarea>
            </div>

            <div class="mb-3">
                <label class="form-check">
                    <input type="checkbox" class="form-check-input" name="status" checked>
                    <span class="form-check-label">Hiển thị ngay</span>
                </label>
            </div>

            <button type="submit" class="btn btn-primary">Lưu lại</button>
            <a href="products.php" class="btn btn-link">Hủy</a>
        </form>
    </div>
</div>
<?php echo adminFooter(); ?>
