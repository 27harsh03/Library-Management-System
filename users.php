<?php
require_once "config.php";

$stmt = $pdo->query("SELECT id, name, email, role, joined FROM users ORDER BY joined DESC");
echo json_encode(["success" => true, "users" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
?>
