<?php
// api/comments.php
// GET  ?projeto_id=X  -> lista os comentários do projeto (mais recentes primeiro)
// POST { projeto_id, usuario_id, text } -> publica um novo comentário
require_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $projeto_id = $_GET['projeto_id'] ?? '';
    if (empty($projeto_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID do projeto é obrigatório']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT co.id, co.texto AS text, co.data AS date, u.nome AS author, u.avatar AS authorAvatar
                            FROM comentarios co
                            JOIN usuarios u ON co.usuario_id = u.id
                            WHERE co.projeto_id = ?
                            ORDER BY co.data DESC");
    $stmt->execute([$projeto_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $projeto_id = $data['projeto_id'] ?? '';
    $usuario_id = $data['usuario_id'] ?? '';
    $texto = trim($data['text'] ?? '');

    if (empty($projeto_id) || empty($usuario_id) || empty($texto)) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados incompletos']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO comentarios (id, projeto_id, usuario_id, texto, data) VALUES (?, ?, ?, ?, NOW())");
    $id = generateId('c');
    if ($stmt->execute([$id, $projeto_id, $usuario_id, $texto])) {
        // Retorna o comentário já formatado, com o nome do autor, para o
        // front-end poder exibir imediatamente sem precisar recarregar tudo.
        $stmt2 = $pdo->prepare("SELECT nome, avatar FROM usuarios WHERE id = ?");
        $stmt2->execute([$usuario_id]);
        $u = $stmt2->fetch(PDO::FETCH_ASSOC);

        // Notifica o dono do projeto (o sininho de notificações) de que
        // recebeu um novo comentário, desde que não esteja comentando
        // no próprio projeto.
        $stmtP = $pdo->prepare("SELECT nome, criado_por FROM projetos WHERE id = ?");
        $stmtP->execute([$projeto_id]);
        $projeto = $stmtP->fetch(PDO::FETCH_ASSOC);
        if ($projeto && !empty($projeto['criado_por']) && $projeto['criado_por'] !== $usuario_id) {
            $autorNome = $u['nome'] ?? 'Alguém';
            $notifId = generateId('not');
            $stmtN = $pdo->prepare("INSERT INTO notificacoes (id, usuario_id, titulo, mensagem, lida, data) VALUES (?, ?, ?, ?, FALSE, CURDATE())");
            $stmtN->execute([
                $notifId,
                $projeto['criado_por'],
                'Novo comentário no seu projeto',
                $autorNome . ' comentou em "' . $projeto['nome'] . '": ' . mb_substr($texto, 0, 120),
            ]);
        }

        echo json_encode([
            'success' => true,
            'id' => $id,
            'comment' => [
                'id' => $id,
                'text' => $texto,
                'date' => date('Y-m-d H:i:s'),
                'author' => $u['nome'] ?? 'Usuário',
                'authorAvatar' => $u['avatar'] ?? null,
            ],
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao salvar comentário']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
