<?php
require_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Listar todos (com filtro opcional)
    $stmt = $pdo->query("SELECT id, nome, email, role, curso, turma, telefone, avatar, created_at FROM usuarios ORDER BY nome");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
} elseif ($method === 'POST') {
    // Criar usuário (admin)
    $data = json_decode(file_get_contents('php://input'), true);
    $id = generateId('u');
    $hash = password_hash($data['password'] ?? '12345678', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO usuarios (id, nome, email, senha_hash, role) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$id, $data['name'], $data['email'], $hash, $data['role']])) {
        echo json_encode(['success' => true, 'id' => $id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar usuário']);
    }
} elseif ($method === 'PUT') {
    // Atualizar usuário
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'];
    $fields = [];
    $params = [];
    foreach (['nome','email','role','curso','turma','telefone','bio','avatar'] as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    if (isset($data['password']) && !empty($data['password'])) {
        $fields[] = "senha_hash = ?";
        $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
    }
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhum campo para atualizar']);
        exit;
    }
    $params[] = $id;
    $sql = "UPDATE usuarios SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    if ($stmt->execute($params)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao atualizar usuário']);
    }
} elseif ($method === 'DELETE') {
    // Deletar usuário
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? '';
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao excluir usuário']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
    }
}
?>