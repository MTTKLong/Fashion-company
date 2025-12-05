<?php
// backend/admin/product-edit.php
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../config/db.php';
require_once 'helpers.php';

startSecureSession();
requireAdmin();
global $pdo;

// Lấy ID
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$product = $pdo->prepare("SELECT * FROM products WHERE id = ?");
$product->execute([$id]);
$item = $product->fetch(PDO::FETCH_ASSOC);

if (!$item) die("Sản phẩm không tồn tại");

$error = '';

// FORM SUBMIT
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name = trim($_POST['name']);
    $price = (float)$_POST['price'];
    $stock = (int)$_POST['stock'];

    // 🔥 FIX LỖI category_id = 0
    $category_id = isset($_POST['category_id']) && $_POST['category_id'] !== ""
        ? (int)$_POST['category_id']
        : $item['category_id'];  // giữ nguyên nếu FE không gửi

    $description = $_POST['description'];

    // FIX status
    $status = isset($_POST['status']) ? 1 : 0;

    // Mặc định dùng ảnh cũ
    $imageBlob = $item['image'];

    // Nếu chọn ảnh mới thì chuyển sang BLOB
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, $allowed)) {
            $error = "Chỉ chấp nhận JPG, PNG, WEBP, GIF";
        } elseif ($_FILES['image']['size'] > 5 * 1024 * 1024) {
            $error = "File ảnh quá lớn (tối đa 5MB)";
        } else {
            $imageBlob = file_get_contents($_FILES['image']['tmp_name']);
        }
    }

    // 🔥 CHECK danh mục có tồn tại không (tránh lỗi FOREIGN KEY)
    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE id = ?");
    $stmtCheck->execute([$category_id]);

    if ($stmtCheck->fetchColumn() == 0) {
        $error = "Danh mục không tồn tại!";
    }

    if (!$error) {
        try {
            $slug = make_slug($name);

            $sql = "UPDATE products 
                    SET name=?, slug=?, category_id=?, price=?, stock=?, description=?, image=?, status=? 
                    WHERE id=?";
            $stmt = $pdo->prepare($sql);

            $stmt->execute([
                $name,
                $slug,
                $category_id,
                $price,
                $stock,
                $description,
                $imageBlob,
                $status,
                $id
            ]);

            $_SESSION['success'] = "Cập nhật thành công!";
            header("Location: products.php");
            exit;

        } catch (Exception $e) {
            $error = "Lỗi: " . $e->getMessage();
        }
    }
}

// Lấy danh mục
$cats = $pdo->query("SELECT * FROM categories")->fetchAll();

echo adminHeader('Sửa Sản phẩm');
?>
<div class="page-header"><h2 class="page-title">Cập nhật Sản phẩm: #<?= $id ?></h2></div>
<div class="card">
    <div class="card-body">

        <?php if ($error) echo showError($error); ?>

        <form method="POST" enctype="multipart/form-data">

            <div class="mb-3">
                <label class="form-label">Tên sản phẩm</label>
                <input type="text" name="name" class="form-control" value="<?= htmlspecialchars($item['name']) ?>" required>
            </div>

            <div class="row">
                <div class="col-md-4 mb-3">
                    <label class="form-label">Giá</label>
                    <input type="number" name="price" class="form-control" value="<?= $item['price'] ?>" required>
                </div>

                <div class="col-md-4 mb-3">
                    <label class="form-label">Tồn kho</label>
                    <input type="number" name="stock" class="form-control" value="<?= $item['stock'] ?>" required>
                </div>

                <div class="col-md-4 mb-3">
                    <label class="form-label">Danh mục</label>
                    <select name="category_id" class="form-select" required>
                        <?php foreach ($cats as $c): ?>
                            <option value="<?= $c['id'] ?>" 
                                <?= $c['id'] == $item['category_id'] ? 'selected' : '' ?>>
                                <?= htmlspecialchars($c['name']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label">Hình ảnh hiện tại</label><br>
                <?php if ($item['image']): ?>
                    <img src="data:image/jpeg;base64,<?= base64_encode($item['image']) ?>" 
                         width="100" class="border rounded mb-2">
                <?php endif; ?>

                <input type="file" name="image" class="form-control">
                <small class="text-muted">Để trống nếu không muốn thay đổi ảnh.</small>
            </div>

            <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea name="description" class="form-control" rows="5"><?= htmlspecialchars($item['description']) ?></textarea>
            </div>

            <div class="mb-3">
                <label class="form-check">
                    <input type="checkbox" class="form-check-input" name="status" <?= $item['status'] ? 'checked' : '' ?>>
                    <span class="form-check-label">Hiển thị sản phẩm</span>
                </label>
            </div>

            <button type="submit" class="btn btn-primary">Cập nhật</button>
            <a href="products.php" class="btn btn-link">Quay lại</a>

        </form>
    </div>
</div>

<?php echo adminFooter(); ?>
