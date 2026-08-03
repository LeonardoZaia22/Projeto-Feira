<?php
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'E-mail é obrigatório']);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['error' => 'E-mail não encontrado']);
    exit;
}

// Aqui você enviaria um e-mail real. Vamos apenas retornar sucesso.
echo json_encode(['success' => true, 'message' => 'Link de recuperação enviado para seu e-mail (simulado)']);
?>