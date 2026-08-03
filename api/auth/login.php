<?php
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$senha = $data['password'] ?? '';

if (empty($email) || empty($senha)) {
    http_response_code(400);
    echo json_encode(['error' => 'E-mail e senha são obrigatórios']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($senha, $user['senha_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'E-mail ou senha inválidos']);
    exit;
}

// Retornar dados do usuário (sem senha)
unset($user['senha_hash']);
echo json_encode(['success' => true, 'user' => $user]);
?>