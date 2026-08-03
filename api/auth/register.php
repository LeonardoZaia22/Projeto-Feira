<?php
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$nome = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$senha = $data['password'] ?? '';
$role = $data['role'] ?? 'visitante';

if (empty($nome) || empty($email) || empty($senha)) {
    http_response_code(400);
    echo json_encode(['error' => 'Todos os campos são obrigatórios']);
    exit;
}

// Verificar se e-mail já existe
$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'E-mail já cadastrado']);
    exit;
}

$id = generateId('u');
$hash = password_hash($senha, PASSWORD_DEFAULT);
$avatar = strtoupper(substr($nome, 0, 2));

$stmt = $pdo->prepare("INSERT INTO usuarios (id, nome, email, senha_hash, role, avatar) VALUES (?, ?, ?, ?, ?, ?)");
if ($stmt->execute([$id, $nome, $email, $hash, $role, $avatar])) {
    echo json_encode(['success' => true, 'user' => ['id' => $id, 'nome' => $nome, 'email' => $email, 'role' => $role, 'avatar' => $avatar]]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao criar usuário']);
}
?>