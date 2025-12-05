<?php
// backend/admin/contact_delete.php
session_start();
require_once '../config/db.php';

// Check if ID is provided
if (isset($_GET['id'])) {
    $id = $_GET['id'];

    try {
        // Prepare DELETE statement
        $sql = "DELETE FROM contact_messages WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            // Success: Redirect back to list
            header("Location: contacts.php?msg=deleted");
        } else {
            echo "Error deleting record.";
        }
    } catch (PDOException $e) {
        die("Error: " . $e->getMessage());
    }
} else {
    // No ID provided, go back
    header("Location: contacts.php");
}
?>