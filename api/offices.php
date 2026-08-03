<?php
// api/offices.php
// Lista as oficinas. Se usuario_id for informado, também retorna:
//  - inscrito: se o aluno marcou que participou/frequentou aquela oficina
//  - votou: se o aluno já votou nessa oficina (voto único por aluno)
require_once 'config/database.php';

$stmt = $pdo->query("SELECT * FROM oficinas ORDER BY data, hora");
$offices = $stmt->fetchAll(PDO::FETCH_ASSOC);

$usuario_id = $_GET['usuario_id'] ?? null;
$votoAtual = null;
if ($usuario_id) {
    $stmt = $pdo->prepare("SELECT oficina_id FROM oficina_votos WHERE usuario_id = ?");
    $stmt->execute([$usuario_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $votoAtual = $row ? $row['oficina_id'] : null;
}

foreach ($offices as &$o) {
    $o['inscrito'] = false;
    $o['votou'] = false;
    if ($usuario_id) {
        $stmt = $pdo->prepare("SELECT 1 FROM inscricoes_oficinas WHERE usuario_id = ? AND oficina_id = ?");
        $stmt->execute([$usuario_id, $o['id']]);
        $o['inscrito'] = $stmt->fetch() ? true : false;
        $o['votou'] = ($votoAtual === $o['id']);
    }
}

echo json_encode($offices);
