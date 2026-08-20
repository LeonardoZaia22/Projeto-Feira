<?php
// api/projects/join.php
// Usa a chave (id do projeto) + senha de acesso para adicionar o usuário
// logado como integrante (membro) do projeto. Chamado depois de
// "Encontrar meu projeto", quando o aluno escolhe "Entrar como integrante".
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$chave = trim($data['chave'] ?? '');
$senha = trim($data['senha'] ?? '');
$usuario_id = trim($data['usuario_id'] ?? '');

if (empty($chave) || empty($senha) || empty($usuario_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados incompletos']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, criado_por, membros, senha_acesso FROM projetos WHERE id = ?");
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

// Confirma se o usuário existe.
$stmtU = $pdo->prepare("SELECT id, turma, curso FROM usuarios WHERE id = ?");
$stmtU->execute([$usuario_id]);
$user = $stmtU->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    http_response_code(400);
    echo json_encode(['error' => 'Usuário inválido']);
    exit;
}

$projectTurma = trim((string)($project['turma'] ?? ''));
$projectCurso = trim((string)($project['curso'] ?? ''));
$userTurma = trim((string)($user['turma'] ?? ''));
$userCurso = trim((string)($user['curso'] ?? ''));

if ($projectTurma !== '' && $projectCurso !== '' && ($userTurma !== $projectTurma || $userCurso !== $projectCurso)) {
    http_response_code(403);
    echo json_encode(['error' => 'Você só pode entrar em projetos da mesma turma e curso.']);
    exit;
}

$membros = json_decode($project['membros'] ?? '[]', true);
if (!is_array($membros)) $membros = [];

if ($project['criado_por'] === $usuario_id) {
    echo json_encode(['success' => true, 'membros' => $membros, 'info' => 'Você já é o criador deste projeto']);
    exit;
}

// Cada aluno pode participar de apenas um projeto (como criador ou membro).
$stmtOwn = $pdo->prepare("SELECT id FROM projetos WHERE criado_por = ? LIMIT 1");
$stmtOwn->execute([$usuario_id]);
if ($stmtOwn->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Você já cadastrou um projeto. Cada aluno pode participar de apenas um projeto.']);
    exit;
}
$stmtMember = $pdo->prepare("SELECT id FROM projetos WHERE id != ? AND JSON_CONTAINS(membros, JSON_QUOTE(?))");
$stmtMember->execute([$chave, $usuario_id]);
if ($stmtMember->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Você já é integrante de outro projeto. Cada aluno pode participar de apenas um projeto.']);
    exit;
}

if (count($membros) >= 4) {
    http_response_code(409);
    echo json_encode(['error' => 'Este projeto já atingiu o limite de 5 participantes.']);
    exit;
}

if (!in_array($usuario_id, $membros, true)) {
    $membros[] = $usuario_id;
    $upd = $pdo->prepare("UPDATE projetos SET membros = ? WHERE id = ?");
    $upd->execute([json_encode($membros), $chave]);
}

echo json_encode(['success' => true, 'membros' => $membros]);
