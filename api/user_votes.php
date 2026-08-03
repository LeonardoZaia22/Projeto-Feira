<?php
// api/user_votes.php
// Retorna os IDs dos projetos em que o usuário já votou. Usado pelo
// front-end para restaurar corretamente o estado "já votei" após login
// ou recarregar a página.
require_once 'config/database.php';

$usuario_id = $_GET['usuario_id'] ?? '';
if (empty($usuario_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Usuário é obrigatório']);
    exit;
}

$stmt = $pdo->prepare("SELECT projeto_id FROM votos WHERE usuario_id = ?");
$stmt->execute([$usuario_id]);
$ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode($ids);
