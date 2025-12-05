<?php
// backend/admin/contacts.php
session_start();
require_once '../config/db.php';

$view_msg = null;

// --- 1. HANDLE ACTIONS ---
if (isset($_GET['action']) && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    
    // ACTION: VIEW (Mark as read & Show Modal)
    if ($_GET['action'] == 'view') {
        // 1. Auto-mark as read if it's currently unread
        $updateSql = "UPDATE contact_messages SET status = 'read' WHERE id = :id AND status = 'unread'";
        $stmt = $pdo->prepare($updateSql);
        $stmt->execute([':id' => $id]);

        // 2. Fetch the specific message data for the modal
        $stmt = $pdo->prepare("SELECT * FROM contact_messages WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $view_msg = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ACTION: DELETE
    if ($_GET['action'] == 'delete') {
        $stmt = $pdo->prepare("DELETE FROM contact_messages WHERE id = :id");
        $stmt->execute([':id' => $id]);
        header("Location: contacts.php?msg=deleted");
        exit;
    }

    // ACTION: MANUAL STATUS CHANGE
    if ($_GET['action'] == 'status' && isset($_GET['val'])) {
        $new_status = $_GET['val'];
        $stmt = $pdo->prepare("UPDATE contact_messages SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $new_status, ':id' => $id]);
        header("Location: contacts.php?msg=updated");
        exit;
    }
}

// --- 2. FETCH ALL MESSAGES ---
// Sắp xếp: Chưa đọc lên đầu, sau đó đến mới nhất
$sql = "SELECT * FROM contact_messages 
        ORDER BY CASE WHEN status = 'unread' THEN 0 ELSE 1 END, created_at DESC";
$stmt = $pdo->query($sql);
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <title>Quản lý Liên hệ - Fashion Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css" rel="stylesheet"/>
    <style>
        .row-unread { background-color: #f0f6ff; font-weight: 600; }
        .row-unread td { color: #182433; }
    </style>
  </head>
  <body class="theme-light">
    <div class="page">
      <div class="page-wrapper">
        
        <div class="page-header d-print-none">
          <div class="container-xl">
            <div class="row g-2 align-items-center">
              <div class="col">
                <h2 class="page-title">Hộp thư khách hàng</h2>
              </div>
            </div>
          </div>
        </div>

        <div class="page-body">
          <div class="container-xl">
            <div class="card">
              <div class="table-responsive">
                <table class="table table-vcenter card-table">
                  <thead>
                    <tr>
                      <th class="w-1">Status</th>
                      <th>Ngày gửi</th>
                      <th>Khách hàng</th>
                      <th>Tiêu đề</th>
                      <th>Nội dung</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <?php if (count($messages) > 0): ?>
                      <?php foreach ($messages as $msg): ?>
                        <tr class="<?= $msg['status'] == 'unread' ? 'row-unread' : '' ?>">
                          
                          <td>
                            <?php if($msg['status'] == 'unread'): ?>
                                <span class="badge bg-red-lt">Mới</span>
                            <?php elseif($msg['status'] == 'replied'): ?>
                                <span class="badge bg-green-lt">Đã trả lời</span>
                            <?php else: ?>
                                <span class="badge bg-gray-lt">Đã xem</span>
                            <?php endif; ?>
                          </td>

                          <td class="text-muted small">
                            <?= date('H:i d/m', strtotime($msg['created_at'])) ?>
                          </td>
                          
                          <td>
                            <div><?= htmlspecialchars($msg['customer_name']) ?></div>
                            <div class="text-muted small"><?= htmlspecialchars($msg['customer_email']) ?></div>
                          </td>
                          
                          <td>
                            <?= htmlspecialchars($msg['subject']) ?>
                          </td>
                          
                          <td class="text-muted">
                            <div class="text-truncate" style="max-width: 250px;">
                                <?= htmlspecialchars($msg['message']) ?>
                            </div>
                          </td>
                          
                          <td>
                            <div class="btn-list flex-nowrap">
                                <!-- VIEW BUTTON: The star of the show -->
                                <a href="contacts.php?action=view&id=<?= $msg['id'] ?>" class="btn btn-primary btn-sm btn-icon" title="Xem & Đánh dấu đã đọc">
                                    <!-- Eye Icon -->
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="2" /><path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7" /></svg>
                                </a>

                                <div class="dropdown">
                                  <button class="btn btn-white btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">Status</button>
                                  <div class="dropdown-menu">
                                    <a class="dropdown-item" href="contacts.php?action=status&val=unread&id=<?= $msg['id'] ?>">🔴 Chưa đọc</a>
                                    <a class="dropdown-item" href="contacts.php?action=status&val=replied&id=<?= $msg['id'] ?>">🟢 Đã trả lời</a>
                                  </div>
                                </div>

                                <a href="contacts.php?action=delete&id=<?= $msg['id'] ?>" 
                                   class="btn btn-danger btn-sm btn-icon"
                                   onclick="return confirm('Xóa tin nhắn này?');">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="4" y1="7" x2="20" y2="7" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                                </a>
                            </div>
                          </td>
                        </tr>
                      <?php endforeach; ?>
                    <?php else: ?>
                      <tr><td colspan="6" class="text-center p-5">Chưa có tin nhắn nào.</td></tr>
                    <?php endif; ?>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- MESSAGE MODAL -->
        <div class="modal modal-blur fade" id="modal-message" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <?php if ($view_msg): ?>
                  <div class="modal-header">
                    <h5 class="modal-title"><?= htmlspecialchars($view_msg['subject']) ?></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Người gửi:</label>
                        <div class="form-control-plaintext">
                            <strong><?= htmlspecialchars($view_msg['customer_name']) ?></strong> 
                            &lt;<?= htmlspecialchars($view_msg['customer_email']) ?>&gt;
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nội dung tin nhắn:</label>
                        <div class="p-3 bg-light rounded text-break" style="white-space: pre-wrap;">
                            <?= htmlspecialchars($view_msg['message']) ?>
                        </div>
                    </div>
                    <div class="text-muted small">
                        Gửi lúc: <?= date('H:i:s d/m/Y', strtotime($view_msg['created_at'])) ?>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <a href="mailto:<?= htmlspecialchars($view_msg['customer_email']) ?>" class="btn btn-primary">
                        Trả lời qua Email
                    </a>
                    <button type="button" class="btn btn-link link-secondary" data-bs-dismiss="modal">Đóng</button>
                  </div>
              <?php endif; ?>
            </div>
          </div>
        </div>

      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/js/tabler.min.js"></script>
    
    <!-- Auto-Open Modal Script -->
    <?php if ($view_msg): ?>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            var myModal = new bootstrap.Modal(document.getElementById('modal-message'));
            myModal.show();
            // Clean URL so refresh doesn't trigger action again
            window.history.replaceState(null, null, window.location.pathname);
        });
    </script>
    <?php endif; ?>
  </body>
</html>