<?php
require_once "config.php";
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $stmt = $pdo->query("SELECT publisher_id, name FROM publishers ORDER BY publisher_id");
    echo json_encode(["success" => true, "publishers" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

} elseif ($method === "POST") {
    $data         = json_decode(file_get_contents("php://input"), true);
    $name         = trim($data["name"]         ?? "");
    $publisher_id = trim($data["publisher_id"] ?? "");

    if (!$name || !$publisher_id) {
        echo json_encode(["success" => false, "message" => "Both Publisher ID and Name are required."]);
        exit;
    }

    $check = $pdo->prepare("SELECT publisher_id FROM publishers WHERE publisher_id = ?");
    $check->execute([$publisher_id]);
    if ($check->fetch()) {
        echo json_encode(["success" => false, "message" => "Publisher ID already exists."]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO publishers (publisher_id, name) VALUES (?, ?)");
    $stmt->execute([$publisher_id, $name]);
    echo json_encode(["success" => true, "message" => "Publisher added."]);
}
?>