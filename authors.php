<?php
require_once "config.php";
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $stmt = $pdo->query("SELECT author_id, name FROM authors ORDER BY author_id");
    echo json_encode(["success" => true, "authors" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

} elseif ($method === "POST") {
    $data      = json_decode(file_get_contents("php://input"), true);
    $name      = trim($data["name"]      ?? "");
    $author_id = trim($data["author_id"] ?? "");

    if (!$name || !$author_id) {
        echo json_encode(["success" => false, "message" => "Both Author ID and Name are required."]);
        exit;
    }

    $check = $pdo->prepare("SELECT author_id FROM authors WHERE author_id = ?");
    $check->execute([$author_id]);
    if ($check->fetch()) {
        echo json_encode(["success" => false, "message" => "Author ID already exists."]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO authors (author_id, name) VALUES (?, ?)");
    $stmt->execute([$author_id, $name]);
    echo json_encode(["success" => true, "message" => "Author added."]);
}
?>