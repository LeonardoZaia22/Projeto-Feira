<?php
// api/vote.php
require_once 'config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$usuario_id = $data['usuario_id'] ?? '';
$projeto_id = $data['projeto_id'] ?? '';

if (empty($usuario_id) || empty($projeto_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Usuário e projeto são obrigatórios']);
    exit;
}

// Verificar se já votou
$stmt = $pdo->prepare("SELECT 1 FROM votos WHERE usuario_id = ? AND projeto_id = ?");
$stmt->execute([$usuario_id, $projeto_id]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Você já votou neste projeto']);
    exit;
}

// Inserir voto e incrementar
$pdo->beginTransaction();
try {
    $stmt = $pdo->prepare("INSERT INTO votos (usuario_id, projeto_id) VALUES (?, ?)");
    $stmt->execute([$usuario_id, $projeto_id]);

    $stmt = $pdo->prepare("UPDATE projetos SET votos = votos + 1 WHERE id = ?");
    $stmt->execute([$projeto_id]);

    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao registrar voto: ' . $e->getMessage()]);
}
?>