<?php
// api/notifications_read.php
require_once 'config/database.php';
$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? '';
if ($id) {
    $stmt = $pdo->prepare("UPDATE notificacoes SET lida = TRUE WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'ID da notificação é obrigatório']);
}