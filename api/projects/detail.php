<?php
require_once '../config/database.php';

$id = $_GET['id'] ?? '';
if (empty($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID do projeto é obrigatório']);
    exit;
}

$stmt = $pdo->prepare("SELECT p.*, c.nome as categoria_nome, c.cor as categoria_cor, t.nome as professor_nome
                        FROM projetos p
                        LEFT JOIN categorias c ON p.categoria_id = c.id
                        LEFT JOIN professores t ON p.professor_id = t.id
                        WHERE p.id = ?");
$stmt->execute([$id]);
$project = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$project) {
    http_response_code(404);
    echo json_encode(['error' => 'Projeto não encontrado']);
    exit;
}

// Buscar comentários reais do projeto (mais recentes primeiro)
$stmtC = $pdo->prepare("SELECT co.id, co.texto AS text, co.data AS date, u.nome AS author, u.avatar AS authorAvatar
                         FROM comentarios co
                         JOIN usuarios u ON co.usuario_id = u.id
                         WHERE co.projeto_id = ?
                         ORDER BY co.data DESC");
$stmtC->execute([$id]);
$project['comments'] = $stmtC->fetchAll(PDO::FETCH_ASSOC);

// Nunca expor o hash da senha de acesso do projeto.
unset($project['senha_acesso']);

echo json_encode($project);
?>