<?php
// Apenas uma resposta de sucesso, pois o logout é gerenciado no front-end (remover token, etc.)
echo json_encode(['success' => true]);
?>