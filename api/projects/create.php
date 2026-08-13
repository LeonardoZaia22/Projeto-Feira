<?php
// api/projects/create.php
// Cadastro de projeto pelo aluno, feito pela página dedicada de cadastro.
// Campos obrigatórios: nome, descrição (mín. 100 caracteres), curso (vem do
// perfil do aluno) e professor orientador. Turma, período, ODS e links são
// opcionais. O projeto é salvo direto como "aprovado" (sem fila de
// aprovação) e fica disponível imediatamente no catálogo.
//
// Ao criar o projeto, é gerada uma CHAVE (o próprio id do projeto) e uma
// SENHA aleatória de acesso. Essas credenciais são devolvidas apenas nesta
// resposta (a senha é guardada com hash no banco) e servem para outros
// integrantes entrarem no projeto depois, em "Encontrar meu projeto".
require_once '../config/database.php';

try {
    $pdo->exec("ALTER TABLE projetos ADD COLUMN IF NOT EXISTS qr_link TEXT NULL AFTER links");
    $pdo->exec("ALTER TABLE projetos ADD COLUMN IF NOT EXISTS qr_code LONGTEXT NULL AFTER qr_link");
} catch (Throwable $e) {
    // Ignora falha de atualização de schema em ambientes antigos ou sem permissão.
}

$data = json_decode(file_get_contents('php://input'), true);

$nome = trim($data['name'] ?? '');
$descricao = trim($data['description'] ?? '');
$professor_id = trim($data['teacher'] ?? '');
$criado_por = $data['criado_por'] ?? null;

$turma = trim($data['turma'] ?? '');
$curso = trim($data['course'] ?? '');
$periodoEnviado = trim($data['periodo'] ?? '');

if (empty($turma) && !empty($criado_por)) {
    $stmtUser = $pdo->prepare("SELECT turma, curso, periodo FROM usuarios WHERE id = ? LIMIT 1");
    $stmtUser->execute([$criado_por]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
    if ($user) {
        $turma = trim($user['turma'] ?? '');
        $curso = trim($user['curso'] ?? '');
        $periodoEnviado = trim($user['periodo'] ?? '');
    }
}

if (empty($curso) && !empty($criado_por)) {
    $stmtUser = $pdo->prepare("SELECT curso FROM usuarios WHERE id = ? LIMIT 1");
    $stmtUser->execute([$criado_por]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
    if ($user) {
        $curso = trim($user['curso'] ?? '');
    }
}

$cursosValidos = ['Informática para Internet', 'Química', 'Logística', 'Recursos Humanos', 'Administração', 'Qualidade'];
$periodosValidos = ['manha', 'tarde', 'noite'];

if (empty($nome) || empty($curso) || empty($professor_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nome do projeto, curso e professor orientador são obrigatórios']);
    exit;
}
if (mb_strlen($descricao) < 100) {
    http_response_code(400);
    echo json_encode(['error' => 'A descrição do projeto precisa ter pelo menos 100 caracteres']);
    exit;
}
if (!in_array($curso, $cursosValidos, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Curso inválido. Complete seu curso no seu perfil antes de cadastrar um projeto.']);
    exit;
}
// Período é opcional na tela de cadastro; se não for enviado ou for
// inválido, usa "manha" (mesmo padrão da coluna no banco).
$periodo = in_array($periodoEnviado, $periodosValidos, true) ? $periodoEnviado : 'manha';

// Confere se o professor orientador selecionado existe.
$stmtProf = $pdo->prepare("SELECT id FROM professores WHERE id = ?");
$stmtProf->execute([$professor_id]);
if (!$stmtProf->fetch()) {
    http_response_code(400);
    echo json_encode(['error' => 'Professor orientador inválido']);
    exit;
}

$id = generateId('p');
$resumo = $data['summary'] ?? mb_substr($descricao, 0, 140);
$objetivos = isset($data['objectives']) ? json_encode($data['objectives']) : null;
$tecnologias = isset($data['tech']) ? json_encode($data['tech']) : null;
$categoria_id = !empty($data['category']) ? $data['category'] : null;
$equipe = json_encode($data['team'] ?? []);
$github = $data['github'] ?? '';
$site = $data['site'] ?? '';
$imagem = $data['image'] ?? '💡';
// Foto de capa e documentação do projeto (arquivos enviados pelo aluno,
// em base64/Data URL — mesmo padrão já usado para a foto de perfil e a
// capa do projeto no restante do sistema).
$capa = $data['cover'] ?? null;
$documento = $data['documento'] ?? null;
$ods = !empty($data['ods']) ? trim($data['ods']) : null;
$links = !empty($data['links']) ? trim($data['links']) : null;
$qrLink = !empty($data['qrLink']) ? trim($data['qrLink']) : null;
$qrCode = !empty($data['qrCode']) ? trim($data['qrCode']) : null;
$created_at = date('Y-m-d');

// Gera a chave (o próprio id do projeto) e a senha de acesso do projeto.
$senhaAcesso = generateAccessPassword(8);
$senhaHash = password_hash($senhaAcesso, PASSWORD_DEFAULT);
$membros = json_encode([$criado_por]);

$stmt = $pdo->prepare("INSERT INTO projetos
    (id, nome, resumo, descricao, objetivos, tecnologias, categoria_id, curso, turma, periodo, professor_id, equipe, github, site, imagem, capa, documento, ods, links, qr_link, qr_code, senha_acesso, membros, criado_por, created_at, status, votos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aprovado', 0)");

if ($stmt->execute([$id, $nome, $resumo, $descricao, $objetivos, $tecnologias, $categoria_id, $curso, $turma, $periodo, $professor_id, $equipe, $github, $site, $imagem, $capa, $documento, $ods, $links, $qrLink, $qrCode, $senhaHash, $membros, $criado_por, $created_at])) {
    echo json_encode(['success' => true, 'id' => $id, 'chave' => $id, 'senha' => $senhaAcesso]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao criar projeto']);
}
