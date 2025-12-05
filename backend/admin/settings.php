<?php
// backend/admin/settings.php
session_start();
require_once '../config/db.php';

$success_msg = "";
$error_msg = "";

// 1. Handle Form Submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        // A. Handle Text Settings (Name, Address, Phone, Email)
        if (isset($_POST['settings']) && is_array($_POST['settings'])) {
            // Using REPLACE INTO or UPDATE logic depending on your preference. 
            // Since we initialized the DB with keys, UPDATE is safer/cleaner.
            $sql = "UPDATE site_settings SET setting_value = :value WHERE setting_key = :key";
            $stmt = $pdo->prepare($sql);

            foreach ($_POST['settings'] as $key => $value) {
                $clean_value = htmlspecialchars(strip_tags($value));
                $stmt->execute([':value' => $clean_value, ':key' => $key]);
            }
        }

        // B. Handle File Upload (The Logo - Persistent Name Logic)
        if (isset($_FILES['site_logo']) && $_FILES['site_logo']['error'] == 0) {
            $allowed = ['jpg', 'jpeg', 'png', 'gif'];
            $filename = $_FILES['site_logo']['name'];
            $filetype = pathinfo($filename, PATHINFO_EXTENSION);

            if (in_array(strtolower($filetype), $allowed)) {
                // 1. Define the persistent name (e.g., site_logo.png)
                $new_filename = "site_logo." . $filetype;
                $target_dir = "../uploads/";
                $target_file = $target_dir . $new_filename;

                // 2. CLEAN UP: Delete any existing site_logo.* to avoid duplicates/confusion
                $existing_files = glob($target_dir . "site_logo.*");
                foreach ($existing_files as $file) {
                    if (is_file($file)) {
                        unlink($file); // Delete the old file
                    }
                }

                // 3. Move the new file
                if (move_uploaded_file($_FILES['site_logo']['tmp_name'], $target_file)) {
                    // Update DB so it knows the extension
                    $stmt = $pdo->prepare("UPDATE site_settings SET setting_value = :val WHERE setting_key = 'site_logo'");
                    $stmt->execute([':val' => $new_filename]);
                    $success_msg = "Settings and Logo updated successfully!";
                } else {
                    $error_msg = "Failed to move uploaded file. Check folder permissions.";
                }
            } else {
                $error_msg = "Invalid file type. Only JPG, PNG, GIF allowed.";
            }
        } else {
            if (empty($error_msg)) $success_msg = "Settings updated successfully!";
        }

    } catch (Exception $e) {
        $error_msg = "Error: " . $e->getMessage();
    }
}

// 2. Fetch Current Data to pre-fill inputs
$current_settings = [];
try {
    $stmt = $pdo->query("SELECT * FROM site_settings");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $current_settings[$row['setting_key']] = $row['setting_value'];
    }
} catch (Exception $e) {
    // Fail silently or log error
}
?>

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <title>Site Settings - Fashion Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css" rel="stylesheet"/>
  </head>
  <body class="theme-light">
    <div class="page">
      <div class="page-wrapper">
        
        <div class="page-header d-print-none">
          <div class="container-xl">
            <div class="row g-2 align-items-center">
              <div class="col">
                <h2 class="page-title">General Settings</h2>
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
                    <h3 class="card-title">Company Identity & Contact</h3>
                  </div>
                  <div class="card-body">
                    
                    <!-- Logo Upload Section -->
                    <div class="mb-4">
                        <label class="form-label">Company Logo</label>
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <?php if (!empty($current_settings['site_logo'])): ?>
                                    <!-- Cache Buster: ?v=time() forces browser to reload image -->
                                    <span class="avatar avatar-xl" style="background-image: url('../uploads/<?= htmlspecialchars($current_settings['site_logo']) ?>?v=<?= time() ?>')"></span>
                                <?php else: ?>
                                    <span class="avatar avatar-xl">No Img</span>
                                <?php endif; ?>
                            </div>
                            <div class="col">
                                <input type="file" name="site_logo" class="form-control" accept="image/*" />
                                <div class="form-text">Upload to replace. Will be saved as site_logo.[ext].</div>
                            </div>
                        </div>
                    </div>

                    <!-- Company Name -->
                    <div class="mb-3">
                      <label class="form-label required">Company Name</label>
                      <input type="text" class="form-control" name="settings[company_name]" 
                             value="<?= htmlspecialchars($current_settings['company_name'] ?? '') ?>" required>
                    </div>

                    <!-- Address -->
                    <div class="mb-3">
                      <label class="form-label">Address</label>
                      <input type="text" class="form-control" name="settings[contact_address]" 
                             value="<?= htmlspecialchars($current_settings['contact_address'] ?? '') ?>">
                    </div>

                    <!-- Phone & Email Grid -->
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Contact Email</label>
                                <input type="email" class="form-control" name="settings[contact_email]" 
                                       value="<?= htmlspecialchars($current_settings['contact_email'] ?? '') ?>">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Phone Number</label>
                                <input type="text" class="form-control" name="settings[contact_phone]" 
                                       value="<?= htmlspecialchars($current_settings['contact_phone'] ?? '') ?>">
                            </div>
                        </div>
                    </div>

                  </div>
                  <div class="card-footer text-end">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
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