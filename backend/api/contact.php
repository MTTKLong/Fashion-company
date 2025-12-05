<?php
// backend/api/contact.php

// 1. Headers to allow React to POST to us
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. Handle the "Preflight" check (React asks permission before sending data)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';

// 3. Get the raw JSON input
$data = json_decode(file_get_contents("php://input"));

// 4. Validate existence
if(
    !empty($data->name) &&
    !empty($data->email) &&
    !empty($data->message)
){
    try {
        // 5. Sanitize (Security Point: Prevent XSS)
        $name = htmlspecialchars(strip_tags($data->name));
        $email = htmlspecialchars(strip_tags($data->email));
        $subject = !empty($data->subject) ? htmlspecialchars(strip_tags($data->subject)) : "No Subject";
        $message = htmlspecialchars(strip_tags($data->message));

        // 6. Insert into DB
        $query = "INSERT INTO contact_messages (customer_name, customer_email, subject, message) 
                  VALUES (:name, :email, :subject, :message)";
        
        $stmt = $pdo->prepare($query);
        
        // Bind parameters (Security Point: Prevent SQL Injection)
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':subject', $subject);
        $stmt->bindParam(':message', $message);

        if($stmt->execute()){
            http_response_code(201); // 201 = Created
            echo json_encode(["message" => "Message sent successfully."]);
        } else {
            throw new Exception("Execute failed");
        }

    } catch (Exception $e) {
        http_response_code(503);
        echo json_encode(["message" => "Unable to send message.", "error" => $e->getMessage()]);
    }
} else {
    http_response_code(400); // 400 = Bad Request
    echo json_encode(["message" => "Incomplete data. Name, Email, and Message are required."]);
}
?>