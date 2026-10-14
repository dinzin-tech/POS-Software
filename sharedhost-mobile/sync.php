<?php
/**
 * DinZin POS - Webhook Sync Receiver Endpoint
 * Receives live POS updates and saves them atomically for the mobile dashboard.
 */

declare(strict_types=1);

// Disable error display in production to avoid corrupting JSON output
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Load configuration
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'config.php not found']);
    exit;
}

$config = require $configFile;

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Allow GET for ping / health-check if API key matches
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $providedKey = $_SERVER['HTTP_X_API_KEY'] ?? ($_GET['key'] ?? '');
    if (!hash_equals($config['api_key'], (string)$providedKey)) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Unauthorized: Invalid API Key']);
        exit;
    }
    echo json_encode([
        'ok' => true,
        'message' => 'DinZin live sync endpoint is online and authorized',
        'server_time' => date('c'),
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method Not Allowed. Use POST to push data.']);
    exit;
}

// 1. Authenticate Request
$providedKey = $_SERVER['HTTP_X_API_KEY'] ?? ($_GET['key'] ?? ($_POST['key'] ?? ''));

if (empty($config['api_key']) || !hash_equals($config['api_key'], (string)$providedKey)) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Unauthorized: Invalid or missing API Key']);
    exit;
}

// 2. Read and Validate Payload
$rawInput = file_get_contents('php://input');
if ($rawInput === false || trim($rawInput) === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Bad Request: Empty request payload']);
    exit;
}

$data = json_decode($rawInput, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Bad Request: Malformed JSON payload']);
    exit;
}

// Inject server received timestamp
$data['server_received_at'] = date('c');
$data['status'] = 'active';

// 3. Atomically Write to Storage File
$dataFile = $config['data_file'] ?? (__DIR__ . '/data/live_data.json');
$dataDir = dirname($dataFile);

if (!is_dir($dataDir)) {
    if (!@mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to create data directory. Check folder permissions.']);
        exit;
    }
}

$encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($encoded === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to re-encode payload']);
    exit;
}

// Use file_put_contents with LOCK_EX for race-condition-free writes
$bytesWritten = @file_put_contents($dataFile, $encoded, LOCK_EX);
if ($bytesWritten === false) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Failed to write data file. Please ensure data/ folder is writable (chmod 755 or 777).'
    ]);
    exit;
}

echo json_encode([
    'ok' => true,
    'message' => 'Synced successfully',
    'timestamp' => time(),
    'bytes_written' => $bytesWritten,
    'store_name' => $data['store']['name'] ?? $config['store_name'] ?? 'FloCafe'
]);
