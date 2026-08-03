<?php
require_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM categorias");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($categories);
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = generateId('c');
    $stmt = $pdo->prepare("INSERT INTO categorias (id, nome, cor, icone) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$id, $data['nome'], $data['cor'], $data['icone'] ?? 'cpu'])) {
        echo json_encode(['success' => true, 'id' => $id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar categoria']);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE categorias SET nome = ?, cor = ?, icone = ? WHERE id = ?");
    if ($stmt->execute([$data['nome'], $data['cor'], $data['icone'] ?? 'cpu', $data['id']])) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao atualizar categoria']);
    }
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? '';
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM categorias WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao excluir categoria']);
        }
    }
}
?>