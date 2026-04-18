<?php
require_once "config.php";

$data       = json_decode(file_get_contents("php://input"), true);
$name       = trim($data["name"]       ?? "");
$email      = trim($data["email"]      ?? "");
$phone      = trim($data["phone"]      ?? "");
$age        = intval($data["age"]      ?? 0);
$password   = urldecode($data["password"]  ?? "");
$role       = trim($data["role"]       ?? "student");
$sap_id     = trim($data["sap_id"]     ?? "");
$course     = trim($data["course"]     ?? "");
$department = trim($data["department"] ?? "");

if (!$name || !$email || !$password || !$sap_id) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

$check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$check->execute([$email]);
if ($check->fetch()) {
    echo json_encode(["success" => false, "message" => "Email already registered."]);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password, age, role) VALUES (?,?,?,?,?,?)");
$stmt->execute([$name, $email, $phone, $password, $age, $role]);
$user_id = $pdo->lastInsertId();

if ($role === "student") {
    $s = $pdo->prepare("INSERT INTO students (user_id, sap_id, course) VALUES (?,?,?)");
    $s->execute([$user_id, $sap_id, $course]);
} else if ($role === "teacher") {
    $t = $pdo->prepare("INSERT INTO teachers (user_id, sap_id, department) VALUES (?,?,?)");
    $t->execute([$user_id, $sap_id, $department]);
}

echo json_encode(["success" => true, "message" => "Account created successfully."]);
?>
