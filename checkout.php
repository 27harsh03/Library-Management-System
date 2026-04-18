<?php
require_once "config.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "POST") {
    $data     = json_decode(file_get_contents("php://input"), true);
    $user_id  = intval($data["user_id"]  ?? 0);
    $book_ids = $data["book_ids"] ?? [];

    if (!$user_id || empty($book_ids)) {
        echo json_encode(["success" => false, "message" => "Invalid data."]);
        exit;
    }

    $total       = count($book_ids);
    $return_date = date("Y-m-d", strtotime("+14 days"));

    $cart = $pdo->prepare("INSERT INTO cart (user_id, book_id, total) VALUES (?, ?, ?)");
    $checkout = $pdo->prepare("INSERT INTO checkout (user_id, book_id, return_date) VALUES (?, ?, ?)");

    foreach ($book_ids as $book_id) {
        $cart->execute([$user_id, intval($book_id), $total]);
        $checkout->execute([$user_id, intval($book_id), $return_date]);
    }

    echo json_encode(["success" => true, "message" => "Checkout successful."]);

} elseif ($method === "GET") {
    $user_id = intval($_GET["user_id"] ?? 0);
    if (!$user_id) {
        echo json_encode(["success" => false, "message" => "User ID required."]);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT c.checkout_id, b.title, c.checkout_date, c.return_date, c.returned
        FROM checkout c
        JOIN books b ON c.book_id = b.id
        WHERE c.user_id = ?
        ORDER BY c.checkout_date DESC
    ");
    $stmt->execute([$user_id]);
    echo json_encode(["success" => true, "borrowed" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}
?>