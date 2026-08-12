<?php
// api/config/database.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$dbname = 'feira_tech_mcm';
$user = 'root';
$pass = ''; // XAMPP default sem senha

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro na conexão com o banco de dados: ' . $e->getMessage()]);
    exit;
}

// Função para gerar IDs únicos
function generateId($prefix = '') {
    return $prefix . uniqid() . rand(100, 999);
}

// Gera uma senha de acesso aleatória e fácil de digitar (usada para
// integrantes entrarem em um projeto pela chave + senha). Evita caracteres
// ambíguos como 0/O e 1/I.
function generateAccessPassword($length = 8) {
    $chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    $senha = '';
    for ($i = 0; $i < $length; $i++) {
        $senha .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $senha;
}
?>