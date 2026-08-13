<?php
require_once '../config/database.php';

$ensureUserColumns = function($pdo) {
    $columns = $pdo->query("SHOW COLUMNS FROM usuarios")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('curso', $columns, true)) {
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN curso VARCHAR(50) AFTER role");
    }
    if (!in_array('turma', $columns, true)) {
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN turma VARCHAR(20) AFTER curso");
    }
    if (!in_array('periodo', $columns, true)) {
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN periodo ENUM('manha','tarde','noite') NOT NULL DEFAULT 'manha' AFTER turma");
    }
};

$ensureUserColumns($pdo);

$data = json_decode(file_get_contents('php://input'), true);
$nome = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$senha = $data['password'] ?? '';
$role = $data['role'] ?? 'visitante';
$periodo = trim((string)($data['periodo'] ?? ''));
$curso = trim((string)($data['curso'] ?? ''));
$turma = trim((string)($data['turma'] ?? ''));

if (empty($nome) || empty($email) || empty($senha)) {
    http_response_code(400);
    echo json_encode(['error' => 'Todos os campos são obrigatórios']);
    exit;
}

if (!in_array($role, ['admin', 'professor', 'aluno', 'visitante'], true)) {
    $role = 'visitante';
}

if ($periodo !== '' && !in_array($periodo, ['manha', 'tarde', 'noite'], true)) {
    $periodo = 'manha';
}

$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'E-mail já cadastrado']);
    exit;
}

$id = generateId('u');
$avatar = strtoupper(substr($nome, 0, 2));
$hash = password_hash($senha, PASSWORD_DEFAULT);

$columns = ['id', 'nome', 'email', 'senha_hash', 'role', 'avatar'];
$values = [$id, $nome, $email, $hash, $role, $avatar];

if ($curso !== '') {
    $columns[] = 'curso';
    $values[] = $curso;
}
if ($turma !== '') {
    $columns[] = 'turma';
    $values[] = $turma;
}
if ($periodo !== '') {
    $columns[] = 'periodo';
    $values[] = $periodo;
}

$colList = implode(', ', $columns);
$placeholders = implode(', ', array_fill(0, count($columns), '?'));

$stmt = $pdo->prepare("INSERT INTO usuarios ($colList) VALUES ($placeholders)");
if ($stmt->execute($values)) {
    echo json_encode([
        'success' => true,
        'user' => ['id' => $id, 'nome' => $nome, 'email' => $email, 'role' => $role, 'avatar' => $avatar, 'curso' => $curso, 'turma' => $turma, 'periodo' => $periodo]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao criar usuário']);
}
?>