<?php
require_once 'config/database.php';

$stmt = $pdo->query("SELECT * FROM logs ORDER BY data_hora DESC LIMIT 50");
$logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($logs);
?>