<?php
require_once 'config/database.php';

$usuario_id = $_GET['usuario_id'] ?? '';
if (empty($usuario_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Usuário é obrigatório']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY data DESC");
$stmt->execute([$usuario_id]);
$notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($notifications);
?>