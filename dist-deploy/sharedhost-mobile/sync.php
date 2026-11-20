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

// Allow GET for ping / health-check or order polling if API key matches
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

// Multi-source API Key extraction (handles Apache, FastCGI, suPHP, mod_rewrite REDIRECT_ prefixes)
$providedKey = $_SERVER['HTTP_X_API_KEY']
    ?? ($_SERVER['REDIRECT_HTTP_X_API_KEY']
    ?? ($_GET['key']
    ?? ($_POST['key'] ?? '')));

if (empty($providedKey) && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = (string)$_SERVER['HTTP_AUTHORIZATION'];
    if (stripos($authHeader, 'Bearer ') === 0) {
        $providedKey = trim(substr($authHeader, 7));
    }
}
if (empty($providedKey) && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $authHeader = (string)$_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    if (stripos($authHeader, 'Bearer ') === 0) {
        $providedKey = trim(substr($authHeader, 7));
    }
}

if (empty($providedKey) && function_exists('getallheaders')) {
    $allH = getallheaders();
    foreach ($allH as $hK => $hV) {
        if (strcasecmp($hK, 'X-API-Key') === 0) {
            $providedKey = (string)$hV;
            break;
        }
        if (strcasecmp($hK, 'Authorization') === 0 && stripos((string)$hV, 'Bearer ') === 0) {
            $providedKey = trim(substr((string)$hV, 7));
            break;
        }
    }
}

// Fallback to JSON payload api_key if sent via POST
$rawInputCached = null;
if (empty($providedKey) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInputCached = file_get_contents('php://input');
    if (!empty($rawInputCached)) {
        $parsedBody = json_decode($rawInputCached, true);
        if (is_array($parsedBody) && !empty($parsedBody['api_key'])) {
            $providedKey = (string)$parsedBody['api_key'];
        }
    }
}

// Authenticate API Key
if (empty($config['api_key']) || !hash_equals((string)$config['api_key'], (string)$providedKey)) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Unauthorized: Invalid or missing API Key']);
    exit;
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$pendingOrdersFile = $dataDir . '/pending_orders.json';
$completedOrdersFile = $dataDir . '/completed_orders.json';
$heartbeatFile = $dataDir . '/pos_heartbeat.json';

/** Candidate data directories across root, dashboard, and sharedhost-mobile deployments */
function getCandidateDataDirs(string $dataDir): array {
    $parent = dirname($dataDir);
    $root = dirname($parent);
    return array_unique(array_filter([
        $dataDir,
        $parent . '/data',
        $parent . '/dashboard/data',
        $parent . '/sharedhost-mobile/data',
        $root . '/data',
        $root . '/dashboard/data',
        $root . '/sharedhost-mobile/data',
    ]));
}

$candidateDirs = getCandidateDataDirs($dataDir);

// Record live POS heartbeat whenever authenticated request reaches sync endpoint
$nowTime = time();
$hbPayload = json_encode([
    'last_seen' => $nowTime,
    'last_seen_iso' => date('c', $nowTime),
    'action' => $action ?: 'push_sync',
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
], JSON_UNESCAPED_SLASHES);

foreach ($candidateDirs as $cDir) {
    if (is_dir($cDir)) {
        @file_put_contents($cDir . '/pos_heartbeat.json', $hbPayload, LOCK_EX);
    }
}

// Action: SET STORE STATUS (POS explicitly toggles open/closed or notifies shutdown)
if ($action === 'set_store_status') {
    $rawInput = $rawInputCached ?? file_get_contents('php://input');
    $payload = json_decode($rawInput ?: '[]', true) ?: $_POST;

    $isOpen = !empty($payload['is_open']);
    $statusText = $payload['status_text'] ?? ($isOpen ? 'Open Now' : 'Currently Closed');
    $message = $payload['message'] ?? ($isOpen ? 'Kitchen Active & Accepting Orders' : 'Restaurant POS is closed.');

    $storeStatus = [
        'synced_at' => date('c'),
        'last_heartbeat' => $isOpen ? time() : 0,
        'is_open' => $isOpen,
        'status_text' => $statusText,
        'message' => $message,
        'opening_hours' => $payload['opening_hours'] ?? null,
    ];

    foreach ($candidateDirs as $cDir) {
        if (!is_dir($cDir)) {
            @mkdir($cDir, 0755, true);
        }
        @file_put_contents($cDir . '/store_status.json', json_encode($storeStatus, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
        if (!$isOpen) {
            @file_put_contents($cDir . '/pos_heartbeat.json', json_encode(['last_seen' => 0, 'last_seen_iso' => null, 'action' => 'closed'], JSON_UNESCAPED_SLASHES), LOCK_EX);
        }
    }

    echo json_encode([
        'ok' => true,
        'is_open' => $isOpen,
        'status_text' => $statusText,
        'message' => $message,
    ]);
    exit;
}

// Action: GET ORDERS (Local POS polls for new online orders)
if ($action === 'get_orders') {
    $orders = [];
    $candidateFiles = [];
    foreach ($candidateDirs as $cDir) {
        $candidateFiles[] = $cDir . '/pending_orders.json';
    }
    $candidateFiles = array_unique($candidateFiles);

    $seen = [];
    foreach ($candidateFiles as $filePath) {
        if (file_exists($filePath)) {
            $raw = @file_get_contents($filePath);
            $decoded = json_decode($raw ?: '[]', true);
            if (is_array($decoded)) {
                foreach ($decoded as $ord) {
                    $id = $ord['order_id'] ?? ($ord['id'] ?? '');
                    if ($id !== '' && !isset($seen[$id])) {
                        $seen[$id] = true;
                        $orders[] = $ord;
                    }
                }
            }
        }
    }

    echo json_encode([
        'ok' => true,
        'count' => count($orders),
        'orders' => $orders,
        'server_time' => date('c'),
    ]);
    exit;
}

// Action: ACKNOWLEDGE ORDERS (Local POS acknowledges orders have been processed, KOT printed)
if ($action === 'ack_orders') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput ?: '[]', true) ?: $_POST;
    $ackIds = $payload['order_ids'] ?? [];
    if (!is_array($ackIds) && !empty($payload['order_id'])) {
        $ackIds = [$payload['order_id']];
    }

    if (empty($ackIds)) {
        echo json_encode(['ok' => true, 'message' => 'No order IDs to acknowledge']);
        exit;
    }

    $ackMap = array_flip($ackIds);
    $acknowledged = [];

    $candidateFiles = [];
    foreach ($candidateDirs as $cDir) {
        $candidateFiles[] = $cDir . '/pending_orders.json';
    }
    $candidateFiles = array_unique($candidateFiles);

    foreach ($candidateFiles as $filePath) {
        if (!file_exists($filePath)) continue;
        $fp = fopen($filePath, 'c+');
        if ($fp && flock($fp, LOCK_EX)) {
            $raw = stream_get_contents($fp);
            $current = json_decode($raw ?: '[]', true);
            $pending = [];
            if (is_array($current)) {
                foreach ($current as $ord) {
                    $id = $ord['order_id'] ?? ($ord['id'] ?? '');
                    $num = $ord['order_number'] ?? '';
                    if (isset($ackMap[$id]) || (!empty($num) && isset($ackMap[$num]))) {
                        $ord['acknowledged_at'] = date('c');
                        $ord['status'] = 'synced';
                        $acknowledged[] = $ord;
                    } else {
                        $pending[] = $ord;
                    }
                }
            }
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode(array_values($pending), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            fflush($fp);
            flock($fp, LOCK_UN);
            fclose($fp);
        }
    }

    // Append to completed orders log across candidate directories
    if (!empty($acknowledged)) {
        foreach ($candidateDirs as $cDir) {
            $cFile = $cDir . '/completed_orders.json';
            $fpC = fopen($cFile, 'c+');
            if ($fpC && flock($fpC, LOCK_EX)) {
                $rawC = stream_get_contents($fpC);
                $history = json_decode($rawC ?: '[]', true);
                if (!is_array($history)) $history = [];
                foreach ($acknowledged as $a) {
                    $history[] = $a;
                }
                // Keep last 500 completed orders
                if (count($history) > 500) {
                    $history = array_slice($history, -500);
                }
                ftruncate($fpC, 0);
                rewind($fpC);
                fwrite($fpC, json_encode($history, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
                fflush($fpC);
                flock($fpC, LOCK_UN);
                fclose($fpC);
            }
        }
    }

    echo json_encode([
        'ok' => true,
        'message' => 'Orders acknowledged successfully',
        'acknowledged_count' => count($acknowledged),
        'remaining_pending' => count($pending),
    ]);
    exit;
}

// Action: PUBLISH RECEIPT (POS publishes official thermal bill receipt)
if ($action === 'publish_receipt') {
    $rawReceipt = $rawInputCached ?? file_get_contents('php://input');
    $payload = json_decode($rawReceipt ?: '[]', true) ?: $_POST;

    $receiptId = preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)($payload['receipt_id'] ?? ($payload['order_id'] ?? '')));
    if ($receiptId === '') {
        $receiptId = 'REC-' . date('ymd-His') . '-' . mt_rand(100, 999);
    }

    $payload['receipt_id'] = $receiptId;
    $retentionSeconds = 4 * 86400;
    $payload['stored_at'] = time();
    $payload['expires_at'] = time() + $retentionSeconds;

    $aliasNum = !empty($payload['order_number']) ? preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)$payload['order_number']) : '';
    $aliasBill = !empty($payload['bill_number']) ? preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)$payload['bill_number']) : '';
    $aliasOriginal = !empty($payload['original_token']) ? preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)$payload['original_token']) : '';

    foreach ($candidateDirs as $cDir) {
        $rDir = $cDir . '/receipts';
        if (!is_dir($rDir)) {
            @mkdir($rDir, 0755, true);
        }
        @file_put_contents($rDir . '/' . $receiptId . '.json', json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        if ($aliasNum !== '' && $aliasNum !== $receiptId) {
            @file_put_contents($rDir . '/' . $aliasNum . '.json', json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        }
        if ($aliasBill !== '' && $aliasBill !== $receiptId) {
            @file_put_contents($rDir . '/' . $aliasBill . '.json', json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        }
        if ($aliasOriginal !== '' && $aliasOriginal !== $receiptId && $aliasOriginal !== $aliasNum) {
            @file_put_contents($rDir . '/' . $aliasOriginal . '.json', json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        }
    }

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? 'fivestarnelamangala.in';
    $billUrl = $protocol . $host . '/bill.php?id=' . urlencode($receiptId);

    echo json_encode([
        'ok' => true,
        'receipt_id' => $receiptId,
        'bill_url' => $billUrl,
        'expires_in_days' => 4,
    ]);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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

// 2. Read and Validate Payload
$rawInput = $rawInputCached ?? file_get_contents('php://input');
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

// Save separate menu catalog if present
if (isset($data['menu_catalog']) && is_array($data['menu_catalog'])) {
    $menuFile = $dataDir . '/menu_catalog.json';
    $menuCatalog = [
        'synced_at' => date('c'),
        'store_name' => $data['store']['name'] ?? $config['store_name'] ?? 'FloCafe',
        'categories' => $data['menu_catalog']['categories'] ?? [],
        'items' => $data['menu_catalog']['items'] ?? [],
    ];
    @file_put_contents($menuFile, json_encode($menuCatalog, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// Save separate store status if present
if (isset($data['store_status']) && is_array($data['store_status'])) {
    $statusFile = $dataDir . '/store_status.json';
    $storeStatus = [
        'synced_at' => date('c'),
        'last_heartbeat' => time(),
        'is_open' => !empty($data['store_status']['is_open']),
        'status_text' => $data['store_status']['status_text'] ?? ($data['store_status']['is_open'] ? 'Open' : 'Closed'),
        'message' => $data['store_status']['message'] ?? '',
        'opening_hours' => $data['store_status']['opening_hours'] ?? null,
    ];
    @file_put_contents($statusFile, json_encode($storeStatus, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// Synchronize order sequence counter from POS orders
$posMaxSeq = 0;
if (isset($data['order_sequence']) && (int)$data['order_sequence'] > 0) {
    $posMaxSeq = max($posMaxSeq, (int)$data['order_sequence']);
}
if (!empty($data['active_orders']) && is_array($data['active_orders'])) {
    foreach ($data['active_orders'] as $ao) {
        if (!empty($ao['order_number']) && preg_match('/^TOK-(\d+)$/i', (string)$ao['order_number'], $m)) {
            $posMaxSeq = max($posMaxSeq, (int)$m[1]);
        }
    }
}
if (!empty($data['recent_bills']) && is_array($data['recent_bills'])) {
    foreach ($data['recent_bills'] as $rb) {
        if (!empty($rb['order_number']) && preg_match('/^TOK-(\d+)$/i', (string)$rb['order_number'], $m)) {
            $posMaxSeq = max($posMaxSeq, (int)$m[1]);
        }
    }
}
if ($posMaxSeq > 0) {
    $today = date('Y-m-d');
    foreach ($candidateDirs as $cDir) {
        if (!is_dir($cDir)) continue;
        $seqFile = $cDir . '/order_sequence.json';
        $currLast = 0;
        if (file_exists($seqFile)) {
            $sRaw = @file_get_contents($seqFile);
            $sData = json_decode($sRaw ?: '[]', true);
            $currLast = (($sData['date'] ?? '') === $today) ? (int)($sData['last_seq'] ?? 0) : 0;
        }
        $newLast = max($currLast, $posMaxSeq);
        @file_put_contents($seqFile, json_encode([
            'date' => $today,
            'last_seq' => $newLast,
            'prefix' => 'TOK',
            'updated_at' => date('c'),
        ], JSON_PRETTY_PRINT), LOCK_EX);
    }
}

// 3. Atomically Write to Storage File
$dataFile = $config['data_file'] ?? ($dataDir . '/live_data.json');
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

