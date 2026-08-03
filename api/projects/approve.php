<?php
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? '';
$status = $data['status'] ?? ''; // 'aprovado' ou 'reprovado'

if (empty($id) || !in_array($status, ['aprovado','reprovado'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$stmt = $pdo->prepare("UPDATE projetos SET status = ? WHERE id = ?");
if ($stmt->execute([$status, $id])) {
    // Registrar log
    $usuario = $data['usuario'] ?? 'Admin';
    $logStmt = $pdo->prepare("INSERT INTO logs (id, usuario, acao) VALUES (?, ?, ?)");
    $logStmt->execute([generateId('l'), $usuario, "Alterou status do projeto $id para $status"]);
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao atualizar status']);
}
?>