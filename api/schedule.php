<?php
require_once 'config/database.php';

$stmt = $pdo->query("SELECT * FROM cronograma ORDER BY data, hora");
$schedule = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($schedule);
?>