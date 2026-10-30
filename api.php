<?php
// Configuration : à adapter
const DB_HOST = 'localhost';
const DB_NAME = 'gestion_reclamations';
const DB_USER = 'root';
const DB_PASS = '';

header('Content-Type: application/json; charset=utf-8');

// colonnes modifiables de chaque table
$COLS = [
    'clients'      => ['nom', 'prenom', 'email', 'telephone', 'adresse'],
    'reclamations' => ['client_id', 'objet', 'description', 'statut'],
];
$LISTE = [
    'clients'      => 'SELECT * FROM clients ORDER BY id DESC',
    'reclamations' => "SELECT r.*, CONCAT(c.nom, ' ', c.prenom) AS client FROM reclamations r "
                    . "JOIN clients c ON c.id = r.client_id ORDER BY r.id DESC",
];

function reponse($code, $data) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// API REST : api.php?t=clients[&id=3] et api.php?t=reclamations[&id=3]
$table = $_GET['t'] ?? '';
if (!isset($COLS[$table])) reponse(404, ['erreur' => 'Ressource inconnue']);
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$cols = $COLS[$table];

try {
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $valeurs = array_map(fn($c) => $body[$c] ?? null, $cols);

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            reponse(200, $pdo->query($LISTE[$table])->fetchAll());
        case 'POST':
            $sql = "INSERT INTO $table (" . implode(',', $cols) . ') VALUES ('
                 . implode(',', array_fill(0, count($cols), '?')) . ')';
            $pdo->prepare($sql)->execute($valeurs);
            reponse(201, ['ok' => true]);
        case 'PUT':
            $sql = "UPDATE $table SET " . implode('=?,', $cols) . '=? WHERE id=?';
            $pdo->prepare($sql)->execute([...$valeurs, $id]);
            reponse(200, ['ok' => true]);
        case 'DELETE':
            $pdo->prepare("DELETE FROM $table WHERE id=?")->execute([$id]);
            reponse(200, ['ok' => true]);
        default:
            reponse(405, ['erreur' => 'Méthode non autorisée']);
    }
} catch (Exception $e) {
    reponse(500, ['erreur' => $e->getMessage()]);
}
