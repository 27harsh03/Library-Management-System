<?php
ob_start();
require_once "config.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $stmt = $pdo->query("
        SELECT b.id, b.code, b.title, b.subject, b.rating,
               a.name AS author_name, p.name AS publisher_name
        FROM books b
        LEFT JOIN authors   a ON b.author_id    = a.author_id
        LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
        ORDER BY b.added_on DESC
    ");
    echo json_encode(["success" => true, "books" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

} elseif ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $code        = trim($data["code"]         ?? "");
    $title       = trim($data["title"]        ?? "");
    $subject     = trim($data["subject"]      ?? "");
    $author_id   = intval($data["author_id"]  ?? 0);
    $pub_id      = intval($data["publisher_id"] ?? 0);

    if (!$code || !$title || !$subject) {
        echo json_encode(["success" => false, "message" => "Code, title and subject are required."]);
        exit;
    }

    if (!preg_match('/^[A-Za-z]\d{3}$/', $code)) {
        echo json_encode(["success" => false, "message" => "Invalid Book Code format. It must start with 1 letter followed by exactly 3 digits (e.g. B007)."]);
        exit;
    }

    $check = $pdo->prepare("SELECT id FROM books WHERE code = ?");
    $check->execute([$code]);
    if ($check->fetch()) {
        echo json_encode(["success" => false, "message" => "Book code already exists."]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO books (code, title, subject, author_id, publisher_id) VALUES (?,?,?,?,?)");
    $stmt->execute([$code, $title, $subject, $author_id ?: null, $pub_id ?: null]);
    echo json_encode(["success" => true, "message" => "Book added."]);

} elseif ($method === "DELETE") {
    $data = json_decode(file_get_contents("php://input"), true);
    $id   = intval($data["id"] ?? 0);
    if (!$id) { echo json_encode(["success" => false, "message" => "ID required."]); exit; }
    $stmt = $pdo->prepare("DELETE FROM books WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["success" => true, "message" => "Book deleted."]);
}
?>
