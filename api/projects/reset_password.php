<?php
// api/projects/reset_password.php
// Gera uma NOVA senha de acesso para o projeto. Por segurança, a senha
// antiga é salva apenas com hash no banco (não pode ser "lida de novo"),
// então esta rota permite ao criador do projeto invalidar a senha atual
// e receber uma nova em texto puro, exibida uma única vez na tela.
// Só o criador do projeto (criado_por) pode chamar esta rota com sucesso.
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = trim($data['id'] ?? '');
$usuario_id = trim($data['usuario_id'] ?? '');

if (empty($id) || empty($usuario_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados incompletos']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, criado_por FROM projetos WHERE id = ?");
$stmt->execute([$id]);
$project = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$project) {
    http_response_code(404);
    echo json_encode(['error' => 'Projeto não encontrado']);
    exit;
}

if ($project['criado_por'] !== $usuario_id) {
    http_response_code(403);
    echo json_encode(['error' => 'Apenas o criador do projeto pode gerar uma nova senha de acesso.']);
    exit;
}

$novaSenha = generateAccessPassword(8);
$novaSenhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);

$upd = $pdo->prepare("UPDATE projetos SET senha_acesso = ? WHERE id = ?");
if ($upd->execute([$novaSenhaHash, $id])) {
    echo json_encode(['success' => true, 'chave' => $id, 'senha' => $novaSenha]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao gerar nova senha']);
}
