<?php
require_once 'config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$projeto_id = $data['projectId'] ?? '';
$professor_id = $data['teacherId'] ?? '';
$criterios = json_encode($data['criteria'] ?? []);
$comentario = $data['comment'] ?? '';

if (empty($projeto_id) || empty($professor_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Projeto e professor são obrigatórios']);
    exit;
}

// Verificar se já existe avaliação
$stmt = $pdo->prepare("SELECT id FROM avaliacoes WHERE projeto_id = ? AND professor_id = ?");
$stmt->execute([$projeto_id, $professor_id]);
if ($stmt->fetch()) {
    // Atualizar
    $stmt = $pdo->prepare("UPDATE avaliacoes SET criterios = ?, comentario = ? WHERE projeto_id = ? AND professor_id = ?");
    $exec = $stmt->execute([$criterios, $comentario, $projeto_id, $professor_id]);
} else {
    // Inserir
    $id = generateId('ev');
    $stmt = $pdo->prepare("INSERT INTO avaliacoes (id, projeto_id, professor_id, criterios, comentario) VALUES (?, ?, ?, ?, ?)");
    $exec = $stmt->execute([$id, $projeto_id, $professor_id, $criterios, $comentario]);
}

if ($exec) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao salvar avaliação']);
}
?>