<?php
// api/oficina_vote.php
// Registra o voto do aluno na "melhor oficina". Cada aluno pode votar em
// APENAS UMA oficina (voto único), e somente em uma oficina que ele
// tenha marcado como frequentada (tabela inscricoes_oficinas).
require_once 'config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$usuario_id = $data['usuario_id'] ?? '';
$oficina_id = $data['oficina_id'] ?? '';

if (empty($usuario_id) || empty($oficina_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Usuário e oficina são obrigatórios']);
    exit;
}

// O aluno só pode votar em oficinas que ele frequentou
$stmt = $pdo->prepare("SELECT 1 FROM inscricoes_oficinas WHERE usuario_id = ? AND oficina_id = ?");
$stmt->execute([$usuario_id, $oficina_id]);
if (!$stmt->fetch()) {
    http_response_code(403);
    echo json_encode(['error' => 'Você só pode votar em oficinas que marcou como frequentadas']);
    exit;
}

// Verificar se já votou em alguma oficina
$stmt = $pdo->prepare("SELECT oficina_id FROM oficina_votos WHERE usuario_id = ?");
$stmt->execute([$usuario_id]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Você já votou na melhor oficina']);
    exit;
}

$pdo->beginTransaction();
try {
    $stmt = $pdo->prepare("INSERT INTO oficina_votos (usuario_id, oficina_id) VALUES (?, ?)");
    $stmt->execute([$usuario_id, $oficina_id]);

    $stmt = $pdo->prepare("UPDATE oficinas SET votos = votos + 1 WHERE id = ?");
    $stmt->execute([$oficina_id]);

    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao registrar voto: ' . $e->getMessage()]);
}
