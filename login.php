<?php
require_once "config.php";

$data     = json_decode(file_get_contents("php://input"), true);
$email    = trim($data["email"]    ?? "");
$password = urldecode($data["password"] ?? "");

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

$stmt = $pdo->prepare("SELECT id, name, role FROM users WHERE email = ? AND password = ?");
$stmt->execute([$email, $password]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode(["success" => true, "id" => $user["id"], "name" => $user["name"], "role" => $user["role"]]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
}
?>
