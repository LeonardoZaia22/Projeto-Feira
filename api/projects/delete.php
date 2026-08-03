<?php
// api/projects/delete.php
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? '';
$usuario_id = $data['usuario_id'] ?? null;

if (empty($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID do projeto é obrigatório']);
    exit;
}

// Se um usuario_id for enviado, só permite excluir o próprio projeto
// (a área administrativa pode excluir sem enviar usuario_id).
if ($usuario_id !== null) {
    $stmt = $pdo->prepare("SELECT criado_por FROM projetos WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Projeto não encontrado']);
        exit;
    }
    if ($row['criado_por'] !== $usuario_id) {
        http_response_code(403);
        echo json_encode(['error' => 'Você só pode excluir projetos que você mesmo cadastrou']);
        exit;
    }
}

$stmt = $pdo->prepare("DELETE FROM projetos WHERE id = ?");
if ($stmt->execute([$id])) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao excluir projeto']);
}
