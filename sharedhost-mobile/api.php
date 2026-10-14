<?php
/**
 * DinZin POS - Mobile Analytics Dashboard API
 * Serves real-time data to index.php with optional PIN protection.
 */

declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(E_ALL);

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'config.php not found']);
    exit;
}

$config = require $configFile;

// Setup session with long cookie lifetime
$lifetime = (int)($config['session_lifetime'] ?? 2592000);
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path' => '/',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$action = $_GET['action'] ?? 'data';

// Helper: Check if authentication is satisfied
function isAuthenticated(array $config): bool {
    $pin = trim((string)($config['dashboard_pin'] ?? ''));
    if ($pin === '') {
        return true; // No PIN configured = public/direct access
    }
    return !empty($_SESSION['dashboard_auth']);
}

// 1. Status Check
if ($action === 'status') {
    $pinRequired = trim((string)($config['dashboard_pin'] ?? '')) !== '';
    echo json_encode([
        'ok' => true,
        'pin_required' => $pinRequired,
        'authenticated' => isAuthenticated($config),
        'store_name' => $config['store_name'] ?? 'FloCafe Restaurant',
        'has_data' => file_exists($config['data_file'] ?? (__DIR__ . '/data/live_data.json'))
    ]);
    exit;
}

// 2. Login with PIN
if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'POST required']);
        exit;
    }

    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true) ?: $_POST;
    $submittedPin = trim((string)($payload['pin'] ?? ''));
    $expectedPin = trim((string)($config['dashboard_pin'] ?? ''));

    if ($expectedPin === '' || hash_equals($expectedPin, $submittedPin)) {
        $_SESSION['dashboard_auth'] = true;
        echo json_encode(['ok' => true, 'message' => 'Unlocked successfully']);
        exit;
    }

    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Incorrect PIN']);
    exit;
}

// 3. Logout
if ($action === 'logout') {
    $_SESSION['dashboard_auth'] = false;
    session_destroy();
    echo json_encode(['ok' => true, 'message' => 'Logged out']);
    exit;
}

// 4. Fetch Live Data
if ($action === 'data') {
    if (!isAuthenticated($config)) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'PIN required', 'auth_required' => true]);
        exit;
    }

    $dataFile = $config['data_file'] ?? (__DIR__ . '/data/live_data.json');
    if (!file_exists($dataFile)) {
        echo json_encode([
            'ok' => true,
            'status' => 'no_data_yet',
            'message' => 'Waiting for first sync from DinZin POS',
            'store' => [
                'name' => $config['store_name'] ?? 'FloCafe Restaurant',
                'currency' => 'INR',
                'currency_symbol' => '₹',
            ],
            'today' => [
                'net_sales' => 0,
                'gross_sales' => 0,
                'refunds' => 0,
                'bill_count' => 0,
                'avg_bill' => 0,
                'active_orders_count' => 0,
                'occupied_tables_count' => 0,
                'total_tables_count' => 0
            ],
            'active_orders' => [],
            'payment_methods' => [],
            'order_types' => [],
            'top_items' => [],
            'recent_bills' => [],
            'hourly_sales' => []
        ]);
        exit;
    }

    $content = file_get_contents($dataFile);
    if ($content === false || trim($content) === '') {
        echo json_encode(['ok' => false, 'error' => 'Empty data file']);
        exit;
    }

    // Output raw cached JSON directly to optimize performance
    echo $content;
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
