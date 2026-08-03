<?php
// api/projects/list.php
require_once '../config/database.php';

$categoria = $_GET['category'] ?? 'all';
$curso = $_GET['course'] ?? 'all';
$status = $_GET['status'] ?? 'all';
$search = $_GET['search'] ?? '';
$sort = $_GET['sort'] ?? 'votes';
$criado_por = $_GET['criado_por'] ?? '';

$sql = "SELECT p.*, c.nome as categoria_nome, c.cor as categoria_cor, t.nome as professor_nome
        FROM projetos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN professores t ON p.professor_id = t.id
        WHERE 1=1";
$params = [];

if ($categoria !== 'all' && $categoria !== '') {
    $sql .= " AND p.categoria_id = ?";
    $params[] = $categoria;
}
if ($curso !== 'all' && $curso !== '') {
    $sql .= " AND p.curso = ?";
    $params[] = $curso;
}
if ($status !== 'all' && $status !== '') {
    $sql .= " AND p.status = ?";
    $params[] = $status;
}
if (!empty($criado_por)) {
    $sql .= " AND p.criado_por = ?";
    $params[] = $criado_por;
}
if (!empty($search)) {
    $sql .= " AND (p.nome LIKE ? OR p.resumo LIKE ? OR p.descricao LIKE ?)";
    $like = "%$search%";
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}

switch ($sort) {
    case 'votes':
        $sql .= " ORDER BY p.votos DESC";
        break;
    case 'recent':
        $sql .= " ORDER BY p.created_at DESC";
        break;
    case 'az':
        $sql .= " ORDER BY p.nome ASC";
        break;
    default:
        $sql .= " ORDER BY p.votos DESC";
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($projects);
