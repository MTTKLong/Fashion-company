<?php
// backend/admin/settings.php
session_start();
require_once '../config/db.php';

$success_msg = "";
$error_msg = "";

// 1. Xử lý Form Submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        // A. Xử lý các cài đặt dạng Text (Tên, Địa chỉ, Slogan...)
        if (isset($_POST['settings']) && is_array($_POST['settings'])) {
            // Sử dụng INSERT ... ON DUPLICATE KEY UPDATE để tự động tạo key mới nếu chưa có
            $sql = "INSERT INTO site_settings (setting_key, setting_value) VALUES (:key, :value) 
                    ON DUPLICATE KEY UPDATE setting_value = :value";
            $stmt = $pdo->prepare($sql);

            foreach ($_POST['settings'] as $key => $value) {
                $clean_value = htmlspecialchars(strip_tags($value));
                $stmt->execute([':key' => $key, ':value' => $clean_value]);
            }
        }

        // B. Xử lý Upload Logo (Giữ tên file cố định để tránh rác server)
        if (isset($_FILES['site_logo']) && $_FILES['site_logo']['error'] == 0) {
            $allowed = ['jpg', 'jpeg', 'png', 'gif'];
            $filename = $_FILES['site_logo']['name'];
            $filetype = pathinfo($filename, PATHINFO_EXTENSION);

            if (in_array(strtolower($filetype), $allowed)) {
                // 1. Đặt tên cố định (site_logo.png/jpg)
                $new_filename = "site_logo." . $filetype;
                $target_dir = "../uploads/";
                $target_file = $target_dir . $new_filename;

                // 2. DỌN DẸP: Xóa các file logo cũ khác đuôi (tránh trường hợp vừa có .png vừa có .jpg)
                $existing_files = glob($target_dir . "site_logo.*");
                foreach ($existing_files as $file) {
                    if (is_file($file)) {
                        unlink($file); 
                    }
                }

                // 3. Di chuyển file mới vào
                if (move_uploaded_file($_FILES['site_logo']['tmp_name'], $target_file)) {
                    // Cập nhật DB
                    $stmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES ('site_logo', :val) ON DUPLICATE KEY UPDATE setting_value = :val");
                    $stmt->execute([':val' => $new_filename]);
                    $success_msg = "Cập nhật thông tin và logo thành công!";
                } else {
                    $error_msg = "Không thể tải file lên. Vui lòng kiểm tra quyền thư mục.";
                }
            } else {
                $error_msg = "Định dạng file không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF.";
            }
        } else {
            if (empty($error_msg)) $success_msg = "Cập nhật thông tin thành công!";
        }

    } catch (Exception $e) {
        $error_msg = "Lỗi: " . $e->getMessage();
    }
}

// 2. Lấy dữ liệu hiện tại để điền vào form
$current_settings = [];
try {
    $stmt = $pdo->query("SELECT * FROM site_settings");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $current_settings[$row['setting_key']] = $row['setting_value'];
    }
} catch (Exception $e) {
    // Fail silently
}
?>

<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <title>Cấu hình Website - Fashion Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css" rel="stylesheet"/>
  </head>
  <body class="theme-light">
    <div class="page">
      <div class="page-wrapper">
        
        <div class="page-header d-print-none">
          <div class="container-xl">
            <div class="row g-2 align-items-center">
              <div class="col">
                <h2 class="page-title">Cấu hình chung</h2>
                <div class="text-muted mt-1">Quản lý thông tin hiển thị trên website</div>
              </div>
            </div>
          </div>
        </div>

        <div class="page-body">
          <div class="container-xl">
            <div class="row row-cards">
              <div class="col-12">
                
                <?php if ($success_msg): ?>
                    <div class="alert alert-success"><?= $success_msg ?></div>
                <?php endif; ?>
                <?php if ($error_msg): ?>
                    <div class="alert alert-danger"><?= $error_msg ?></div>
                <?php endif; ?>

                <form action="settings.php" method="POST" enctype="multipart/form-data" class="card">
                  <div class="card-header">
                    <h3 class="card-title">Thông tin doanh nghiệp</h3>
                  </div>
                  <div class="card-body">
                    
                    <!-- Logo Upload Section -->
                    <div class="mb-4">
                        <label class="form-label">Logo Công Ty</label>
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <?php if (!empty($current_settings['site_logo'])): ?>
                                    <!-- Cache Buster: ?v=time() để ép trình duyệt tải ảnh mới -->
                                    <span class="avatar avatar-xl" style="background-image: url('../uploads/<?= htmlspecialchars($current_settings['site_logo']) ?>?v=<?= time() ?>')"></span>
                                <?php else: ?>
                                    <span class="avatar avatar-xl">No Img</span>
                                <?php endif; ?>
                            </div>
                            <div class="col">
                                <input type="file" name="site_logo" class="form-control" accept="image/*" />
                                <div class="form-text">Tải lên để thay thế logo hiện tại. File sẽ được lưu đè.</div>
                            </div>
                        </div>
                    </div>

                    <!-- Company Name -->
                    <div class="mb-3">
                      <label class="form-label required">Tên Công Ty / Thương Hiệu</label>
                      <input type="text" class="form-control" name="settings[company_name]" 
                             value="<?= htmlspecialchars($current_settings['company_name'] ?? '') ?>" required>
                    </div>

                    <!-- Slogan -->
                    <div class="mb-3">
                      <label class="form-label">Slogan (Khẩu hiệu)</label>
                      <input type="text" class="form-control" name="settings[company_slogan]" 
                             value="<?= htmlspecialchars($current_settings['company_slogan'] ?? '') ?>" 
                             placeholder="VD: Phong cách dẫn đầu xu hướng">
                    </div>

                    <!-- Address -->
                    <div class="mb-3">
                      <label class="form-label">Địa chỉ trụ sở</label>
                      <input type="text" class="form-control" name="settings[contact_address]" 
                             value="<?= htmlspecialchars($current_settings['contact_address'] ?? '') ?>">
                    </div>

                    <!-- Phone & Email Grid -->
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Email liên hệ</label>
                                <input type="email" class="form-control" name="settings[contact_email]" 
                                       value="<?= htmlspecialchars($current_settings['contact_email'] ?? '') ?>">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Số điện thoại / Hotline</label>
                                <input type="text" class="form-control" name="settings[contact_phone]" 
                                       value="<?= htmlspecialchars($current_settings['contact_phone'] ?? '') ?>">
                            </div>
                        </div>
                    </div>

                    <!-- Working Hours -->
                    <div class="mb-3">
                      <label class="form-label">Giờ làm việc</label>
                      <input type="text" class="form-control" name="settings[working_hours]" 
                             value="<?= htmlspecialchars($current_settings['working_hours'] ?? '') ?>"
                             placeholder="VD: 8:00 - 22:00, Thứ 2 - Chủ Nhật">
                    </div>

                  </div>
                  <div class="card-footer text-end">
                    <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>