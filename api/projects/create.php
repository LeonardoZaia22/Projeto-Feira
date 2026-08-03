<?php
// api/projects/create.php
// Cadastro de projeto pelo aluno. Conforme solicitado, o aluno só precisa
// informar: nome do projeto, turma, curso e período (manhã/tarde/noite).
// O projeto é salvo direto como "aprovado" (não passa por fila de aprovação)
// e fica disponível imediatamente no catálogo para todos os visitantes.
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$nome = trim($data['name'] ?? '');
$turma = trim($data['turma'] ?? '');
$curso = trim($data['course'] ?? '');
$periodo = trim($data['periodo'] ?? '');

$cursosValidos = ['Informática para Internet', 'Química', 'Logística', 'Recursos Humanos', 'Administração', 'Qualidade'];
$periodosValidos = ['manha', 'tarde', 'noite'];

if (empty($nome) || empty($turma) || empty($curso) || empty($periodo)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nome do projeto, turma, curso e período são obrigatórios']);
    exit;
}
if (!in_array($curso, $cursosValidos, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Curso inválido']);
    exit;
}
if (!in_array($periodo, $periodosValidos, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Período inválido. Use manha, tarde ou noite']);
    exit;
}

$id = generateId('p');
$resumo = $data['summary'] ?? null;
$descricao = $data['description'] ?? null;
$objetivos = isset($data['objectives']) ? json_encode($data['objectives']) : null;
$tecnologias = isset($data['tech']) ? json_encode($data['tech']) : null;
$categoria_id = !empty($data['category']) ? $data['category'] : null;
$professor_id = !empty($data['teacher']) ? $data['teacher'] : null;
$equipe = json_encode($data['team'] ?? []);
$github = $data['github'] ?? '';
$site = $data['site'] ?? '';
$imagem = $data['image'] ?? '💡';
// Foto de capa do projeto (imagem enviada pelo aluno, em base64/Data URL).
// Campo opcional: se não for enviado, o projeto fica só com o emoji acima.
$capa = $data['cover'] ?? null;
$criado_por = $data['criado_por'] ?? null;
$created_at = date('Y-m-d');

$stmt = $pdo->prepare("INSERT INTO projetos
    (id, nome, resumo, descricao, objetivos, tecnologias, categoria_id, curso, turma, periodo, professor_id, equipe, github, site, imagem, capa, criado_por, created_at, status, votos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aprovado', 0)");

if ($stmt->execute([$id, $nome, $resumo, $descricao, $objetivos, $tecnologias, $categoria_id, $curso, $turma, $periodo, $professor_id, $equipe, $github, $site, $imagem, $capa, $criado_por, $created_at])) {
    echo json_encode(['success' => true, 'id' => $id]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao criar projeto']);
}
