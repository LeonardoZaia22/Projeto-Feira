<?php
// api/projects/find.php
// Localiza um projeto pela chave (o id do projeto) + senha de acesso
// geradas no cadastro. Usado no botão "Encontrar meu projeto".
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$chave = trim($data['chave'] ?? '');
$senha = trim($data['senha'] ?? '');

if (empty($chave) || empty($senha)) {
    http_response_code(400);
    echo json_encode(['error' => 'Informe a chave e a senha do projeto']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM projetos WHERE id = ?");
$stmt->execute([$chave]);
$project = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$project) {
    http_response_code(404);
    echo json_encode(['error' => 'Chave não encontrada']);
    exit;
}
if (empty($project['senha_acesso']) || !password_verify($senha, $project['senha_acesso'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Senha incorreta']);
    exit;
}

// Nunca expor o hash da senha nem o documento (arquivo grande) por aqui.
unset($project['senha_acesso']);
unset($project['documento']);

echo json_encode(['success' => true, 'project' => $project]);
