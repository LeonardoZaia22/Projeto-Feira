<?php
require_once 'config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$usuario_id = $data['usuario_id'] ?? '';
$oficina_id = $data['oficina_id'] ?? '';

if (empty($usuario_id) || empty($oficina_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados incompletos']);
    exit;
}

// Verificar se já está inscrito
$stmt = $pdo->prepare("SELECT 1 FROM inscricoes_oficinas WHERE usuario_id = ? AND oficina_id = ?");
$stmt->execute([$usuario_id, $oficina_id]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Você já está inscrito nesta oficina']);
    exit;
}

// Verificar vagas disponíveis
$stmt = $pdo->prepare("SELECT vagas, (SELECT COUNT(*) FROM inscricoes_oficinas WHERE oficina_id = ?) as inscritos FROM oficinas WHERE id = ?");
$stmt->execute([$oficina_id, $oficina_id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if ($row && $row['inscritos'] >= $row['vagas']) {
    http_response_code(400);
    echo json_encode(['error' => 'Não há vagas disponíveis']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO inscricoes_oficinas (usuario_id, oficina_id) VALUES (?, ?)");
if ($stmt->execute([$usuario_id, $oficina_id])) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao realizar inscrição']);
}
?>