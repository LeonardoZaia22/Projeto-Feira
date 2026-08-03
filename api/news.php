<?php
require_once 'config/database.php';

$stmt = $pdo->query("SELECT * FROM noticias ORDER BY data DESC");
$news = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($news);
?>