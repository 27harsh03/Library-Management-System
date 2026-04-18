<?php
require_once "config.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $stmt = $pdo->query("
        SELECT r.review_id, b.title AS book_title, u.name AS user_name,
               r.rating, r.review_text, r.created_on
        FROM reviews r
        JOIN books b ON r.book_id = b.id
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_on DESC
    ");
    echo json_encode(["success" => true, "reviews" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

} elseif ($method === "POST") {
    $data        = json_decode(file_get_contents("php://input"), true);
    $user_id     = intval($data["user_id"]     ?? 0);
    $book_id     = intval($data["book_id"]     ?? 0);
    $rating      = intval($data["rating"]      ?? 0);
    $review_text = trim($data["review_text"]   ?? "");

    if (!$user_id || !$book_id || !$rating || !$review_text) {
        echo json_encode(["success" => false, "message" => "All fields required."]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO reviews (user_id, book_id, rating, review_text) VALUES (?,?,?,?)");
    $stmt->execute([$user_id, $book_id, $rating, $review_text]);

    $avg = $pdo->prepare("SELECT AVG(rating) as avg_rating FROM reviews WHERE book_id = ?");
    $avg->execute([$book_id]);
    $row = $avg->fetch(PDO::FETCH_ASSOC);
    $pdo->prepare("UPDATE books SET rating = ? WHERE id = ?")->execute([round($row["avg_rating"],1), $book_id]);

    echo json_encode(["success" => true, "message" => "Review submitted."]);
}
?>
