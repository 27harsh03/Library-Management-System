<?php
require_once "config.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {

    // ── Only admin should call this endpoint ──────────────────────
    // Frontend already guards via ng-if, but we double-check here.
    $role = $_GET["role"] ?? "";
    if ($role !== "admin") {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Access denied. Admins only."]);
        exit;
    }

    /*
     * JOIN query explanation:
     *
     *  checkout  ──(checkout.user_id = users.id)──►  users
     *            ──(checkout.book_id = books.id) ──►  books
     *                                                   │
     *                                    (books.author_id = authors.author_id) ──► authors
     *
     *  Four tables joined so the admin sees:
     *    • who borrowed  (user name, email, role)
     *    • which book    (title, code, subject)
     *    • who wrote it  (author name)
     *    • when & status (checkout_date, return_date, returned)
     */
    $stmt = $pdo->query("
        SELECT
            c.checkout_id,

            -- User info (from users table via JOIN on user_id)
            u.id            AS user_id,
            u.name          AS user_name,
            u.email         AS user_email,
            u.role          AS user_role,

            -- Book info (from books table via JOIN on book_id)
            b.id            AS book_id,
            b.code          AS book_code,
            b.title         AS book_title,
            b.subject       AS book_subject,

            -- Author info (from authors table via JOIN on author_id)
            a.name          AS author_name,

            -- Checkout details
            c.checkout_date,
            c.return_date,
            c.returned

        FROM checkout c

        -- Join 1: link each checkout row to the borrowing user
        INNER JOIN users   u  ON c.user_id  = u.id

        -- Join 2: link each checkout row to the borrowed book
        INNER JOIN books   b  ON c.book_id  = b.id

        -- Join 3: link each book to its author
        LEFT  JOIN authors a  ON b.author_id = a.author_id

        ORDER BY c.checkout_date DESC
    ");

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "total"   => count($rows),
        "report"  => $rows
    ]);

} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
}
?>
