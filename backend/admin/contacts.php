<?php
// backend/admin/contacts.php
session_start();
require_once '../config/db.php';

// 1. Fetch all messages from the database, newest first
$sql = "SELECT * FROM contact_messages ORDER BY created_at DESC";
$stmt = $pdo->query($sql);
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <title>Manage Contacts - Fashion Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css" rel="stylesheet"/>
  </head>
  <body class="theme-light">
    <div class="page">
      <div class="page-wrapper">
        
        <!-- Page Header -->
        <div class="page-header d-print-none">
          <div class="container-xl">
            <div class="row g-2 align-items-center">
              <div class="col">
                <h2 class="page-title">
                  Customer Messages
                </h2>
                <div class="text-muted mt-1">View and manage inquiries</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Page Body -->
        <div class="page-body">
          <div class="container-xl">
            <div class="card">
              <div class="table-responsive">
                <table class="table table-vcenter card-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th class="w-1">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <?php if (count($messages) > 0): ?>
                      <?php foreach ($messages as $msg): ?>
                        <tr>
                          <td class="text-muted">
                            <?= date('M d, H:i', strtotime($msg['created_at'])) ?>
                          </td>
                          <td>
                            <div class="font-weight-medium"><?= htmlspecialchars($msg['customer_name']) ?></div>
                            <div class="text-muted small"><?= htmlspecialchars($msg['customer_email']) ?></div>
                          </td>
                          <td>
                            <?= htmlspecialchars($msg['subject']) ?>
                          </td>
                          <td class="text-muted">
                            <?= nl2br(htmlspecialchars(substr($msg['message'], 0, 50))) ?>...
                          </td>
                          <td>
                            <a href="contact_delete.php?id=<?= $msg['id'] ?>" 
                               class="btn btn-danger btn-sm"
                               onclick="return confirm('Are you sure you want to delete this message?');">
                              Delete
                            </a>
                          </td>
                        </tr>
                      <?php endforeach; ?>
                    <?php else: ?>
                      <tr>
                        <td colspan="5" class="text-center p-4">No messages found.</td>
                      </tr>
                    <?php endif; ?>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </body>
</html>