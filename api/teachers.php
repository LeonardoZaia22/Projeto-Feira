<?php
// api/teachers.php
// Lista os professores cadastrados, usados como "professor orientador" no
// cadastro de projetos.
require_once 'config/database.php';

$stmt = $pdo->query("SELECT id, nome, curso, avatar FROM professores ORDER BY nome ASC");
$teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($teachers);
