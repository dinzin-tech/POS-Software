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

// CORS headers for public API calls from website
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$action = $_GET['action'] ?? ($_POST['action'] ?? 'data');
$dataDir = __DIR__ . '/data';

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

/**
 * Evaluates live restaurant open/closed status based on active POS heartbeat.
 * FloCafe POS polls sync.php every 4 seconds when online.
 * Uses a safe 180s (3-minute) window to handle network jitter without false closures.
 */
function resolveDynamicStoreStatus(string $dataDir, array $config): array {
    $candidateDirs = getCandidateDataDirs($dataDir);
    $lastHeartbeat = 0;
    $manualOpen = true;
    $statusMessage = '';
    $openingHours = null;

    foreach ($candidateDirs as $dir) {
        $hbFile = $dir . '/pos_heartbeat.json';
        if (file_exists($hbFile)) {
            $hbRaw = @file_get_contents($hbFile);
            $hbData = json_decode($hbRaw ?: '[]', true);
            if (is_array($hbData) && !empty($hbData['last_seen'])) {
                $lastHeartbeat = max($lastHeartbeat, (int)$hbData['last_seen']);
            }
        }
        $stFile = $dir . '/store_status.json';
        if (file_exists($stFile)) {
            $stRaw = @file_get_contents($stFile);
            $stData = json_decode($stRaw ?: '[]', true);
            if (is_array($stData)) {
                if (isset($stData['is_open'])) {
                    $manualOpen = !empty($stData['is_open']);
                }
                if (!empty($stData['last_heartbeat'])) {
                    $lastHeartbeat = max($lastHeartbeat, (int)$stData['last_heartbeat']);
                }
                if (!empty($stData['message'])) {
                    $statusMessage = $stData['message'];
                }
                if (!empty($stData['opening_hours'])) {
                    $openingHours = $stData['opening_hours'];
                }
            }
        }
    }

    // POS heartbeat freshness: the local POS polls `get_orders` every 4 seconds when running.
    // 180 seconds window accommodates minor network jitter while closing cleanly within 3 minutes of power off.
    $heartbeatMaxAgeSeconds = 180;
    $isPosOnline = ($lastHeartbeat > 0) && ((time() - $lastHeartbeat) <= $heartbeatMaxAgeSeconds);

    // Dynamic Store Open condition:
    // Store is OPEN ONLY IF:
    // 1. POS is currently online ($isPosOnline === true)
    // 2. POS store status is not manually paused ($manualOpen === true)
    $storeOpen = $isPosOnline && $manualOpen;

    if (!$isPosOnline) {
        $statusText = 'Currently Closed';
        $statusMessage = 'Restaurant POS is offline. Online ordering will resume when kitchen opens.';
    } elseif (!$manualOpen) {
        $statusText = 'Temporarily Paused';
        $statusMessage = $statusMessage ?: 'Online ordering paused temporarily by the restaurant.';
    } else {
        $statusText = 'Open Now';
        $statusMessage = $statusMessage ?: 'Kitchen Active & Accepting Orders';
    }

    return [
        'store_open' => $storeOpen,
        'pos_online' => $isPosOnline,
        'status_text' => $statusText,
        'message' => $statusMessage,
        'opening_hours' => $openingHours,
        'last_pos_seen' => $lastHeartbeat > 0 ? date('c', $lastHeartbeat) : null,
    ];
}

// ==========================================
// PUBLIC ENDPOINT 1: FETCH DYNAMIC MENU & STORE STATUS
// ==========================================
if ($action === 'menu') {
    $menuFile = $dataDir . '/menu_catalog.json';
    $dynamicStatus = resolveDynamicStoreStatus($dataDir, $config);

    $catalog = [
        'ok' => true,
        'store_open' => $dynamicStatus['store_open'],
        'pos_online' => $dynamicStatus['pos_online'],
        'status_text' => $dynamicStatus['status_text'],
        'message' => $dynamicStatus['message'],
        'opening_hours' => $dynamicStatus['opening_hours'],
        'last_pos_seen' => $dynamicStatus['last_pos_seen'],
        'store_name' => $config['store_name'] ?? 'FloCafe',
        'payment_config' => [
            'razorpay_enabled' => !empty($config['razorpay_enabled']),
            'razorpay_key_id' => $config['razorpay_key_id'] ?? '',
        ],
        'categories' => [],
        'items' => [],
        'synced_at' => null,
    ];

    if (file_exists($menuFile)) {
        $menuRaw = @file_get_contents($menuFile);
        $menuData = json_decode($menuRaw ?: '[]', true);
        if (is_array($menuData)) {
            $catalog['categories'] = $menuData['categories'] ?? [];
            $catalog['items'] = $menuData['items'] ?? [];
            $catalog['synced_at'] = $menuData['synced_at'] ?? null;
            if (!empty($menuData['store_name'])) {
                $catalog['store_name'] = $menuData['store_name'];
            }
        }
    }

    echo json_encode($catalog, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// Action: GET PAYMENT CONFIG
if ($action === 'payment_config') {
    echo json_encode([
        'ok' => true,
        'razorpay_enabled' => !empty($config['razorpay_enabled']),
        'razorpay_key_id' => $config['razorpay_key_id'] ?? '',
        'store_name' => $config['store_name'] ?? 'FloCafe Restaurant',
    ]);
    exit;
}

// Action: ORDER STATUS (Check if POS has processed order, assigned Token / Bill Number)
if ($action === 'order_status') {
    $reqId = preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)($_GET['order_id'] ?? ($_GET['id'] ?? ($_GET['token'] ?? ''))));
    $phone = preg_replace('/\D/', '', (string)($_GET['phone'] ?? ''));

    if ($reqId === '' && $phone === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Missing order_id or phone']);
        exit;
    }

    $receiptsDir = $dataDir . '/receipts';

    // 1. If lookup by exact Token or Order ID
    if ($reqId !== '') {
        $rFile = $receiptsDir . '/' . $reqId . '.json';
        if (file_exists($rFile)) {
            $rData = json_decode(@file_get_contents($rFile) ?: '[]', true);
            if (is_array($rData)) {
                $bNum = $rData['bill_number'] ?? '';
                $isProcessed = !empty($bNum) && stripos($bNum, 'Processing') === false;
                echo json_encode([
                    'ok' => true,
                    'status' => $isProcessed ? 'confirmed' : 'pending',
                    'order_id' => $rData['online_order_id'] ?? ($rData['receipt_id'] ?? $reqId),
                    'order_number' => $rData['order_number'] ?? $reqId,
                    'bill_number' => $isProcessed ? $bNum : null,
                    'customer_name' => $rData['customer_name'] ?? '',
                    'customer_phone' => $rData['customer_phone'] ?? '',
                    'order_type' => $rData['order_type'] ?? 'Takeaway',
                    'table_number' => $rData['table_number'] ?? '',
                    'items' => $rData['items'] ?? [],
                    'subtotal' => $rData['subtotal'] ?? 0,
                    'tax_amount' => $rData['tax_amount'] ?? 0,
                    'total' => $rData['total'] ?? 0,
                    'paid_amount' => $rData['paid_amount'] ?? 0,
                    'balance' => $rData['balance'] ?? 0,
                    'payment_status' => $rData['payment_status'] ?? 'PAID',
                    'payment_method' => $rData['payment_method'] ?? 'ONLINE',
                    'created_at' => $rData['created_date_formatted'] ?? date('d/m/Y g:i:s a', (int)($rData['stored_at'] ?? time())),
                    'bill_url' => '/bill.php?id=' . urlencode($rData['order_number'] ?? $reqId),
                ]);
                exit;
            }
        }

        // Check completed orders history across all candidate data dirs
        $candidateDirs = getCandidateDataDirs($dataDir);
        foreach ($candidateDirs as $cDir) {
            $completedFile = $cDir . '/completed_orders.json';
            if (file_exists($completedFile)) {
                $cRaw = @file_get_contents($completedFile);
                $cList = json_decode($cRaw ?: '[]', true);
                if (is_array($cList)) {
                    foreach ($cList as $co) {
                        if (($co['order_id'] ?? '') === $reqId || ($co['order_number'] ?? '') === $reqId) {
                            echo json_encode([
                                'ok' => true,
                                'status' => 'confirmed',
                                'order_id' => $co['order_id'] ?? $reqId,
                                'order_number' => $co['order_number'] ?? $reqId,
                                'bill_number' => $co['bill_number'] ?? null,
                                'customer_name' => $co['customer']['name'] ?? ($co['customer_name'] ?? ''),
                                'customer_phone' => $co['customer']['phone'] ?? ($co['customer_phone'] ?? ''),
                                'order_type' => $co['order_type'] ?? 'Takeaway',
                                'table_number' => $co['table_number'] ?? '',
                                'items' => $co['items'] ?? [],
                                'subtotal' => $co['subtotal'] ?? 0,
                                'tax_amount' => $co['tax_amount'] ?? 0,
                                'total' => $co['total'] ?? 0,
                                'paid_amount' => $co['paid_amount'] ?? ($co['total'] ?? 0),
                                'payment_status' => strtoupper((string)($co['payment_status'] ?? 'PAID')),
                                'payment_method' => strtoupper((string)($co['payment_method'] ?? 'ONLINE')),
                                'created_at' => $co['created_at'] ?? date('c'),
                                'bill_url' => '/bill.php?id=' . urlencode($co['order_number'] ?? $reqId),
                            ]);
                            exit;
                        }
                    }
                }
            }
        }

        // Check pending orders across all candidate data dirs
        foreach ($candidateDirs as $cDir) {
            $pendingFile = $cDir . '/pending_orders.json';
            if (file_exists($pendingFile)) {
                $pRaw = @file_get_contents($pendingFile);
                $pList = json_decode($pRaw ?: '[]', true);
                if (is_array($pList)) {
                    foreach ($pList as $po) {
                        if (($po['order_id'] ?? '') === $reqId || ($po['order_number'] ?? '') === $reqId) {
                            echo json_encode([
                                'ok' => true,
                                'status' => 'pending',
                                'order_id' => $po['order_id'] ?? $reqId,
                                'order_number' => $po['order_number'] ?? $reqId,
                                'bill_number' => null,
                                'customer_name' => $po['customer']['name'] ?? ($po['customer_name'] ?? ''),
                                'customer_phone' => $po['customer']['phone'] ?? ($po['customer_phone'] ?? ''),
                                'order_type' => $po['order_type'] ?? 'Takeaway',
                                'table_number' => $po['table_number'] ?? '',
                                'items' => $po['items'] ?? [],
                                'subtotal' => $po['subtotal'] ?? 0,
                                'tax_amount' => $po['tax_amount'] ?? 0,
                                'total' => $po['total'] ?? 0,
                                'paid_amount' => $po['paid_amount'] ?? 0,
                                'payment_status' => strtoupper((string)($po['payment_status'] ?? 'UNPAID')),
                                'payment_method' => strtoupper((string)($po['payment_method'] ?? 'CASH')),
                                'created_at' => $po['created_at'] ?? date('c'),
                                'bill_url' => '/bill.php?id=' . urlencode($po['order_number'] ?? $reqId),
                            ]);
                            exit;
                        }
                    }
                }
            }
        }
    }

    // 2. If lookup by Phone number (matches last 10 digits)
    if ($phone !== '' && strlen($phone) >= 10) {
        $last10 = substr($phone, -10);
        // Check receipts folder for matching phone
        if (is_dir($receiptsDir)) {
            $rFiles = glob($receiptsDir . '/*.json');
            if ($rFiles) {
                // sort by newest modified
                usort($rFiles, function($a, $b) {
                    return filemtime($b) - filemtime($a);
                });
                foreach ($rFiles as $f) {
                    $cRaw = @file_get_contents($f);
                    $cData = json_decode($cRaw ?: '[]', true);
                    if (is_array($cData)) {
                        $pDigits = preg_replace('/\D/', '', (string)($cData['customer_phone'] ?? ''));
                        if (substr($pDigits, -10) === $last10) {
                            $bNum = $cData['bill_number'] ?? '';
                            $isProcessed = !empty($bNum) && stripos($bNum, 'Processing') === false;
                            echo json_encode([
                                'ok' => true,
                                'status' => $isProcessed ? 'confirmed' : 'pending',
                                'order_id' => $cData['online_order_id'] ?? ($cData['receipt_id'] ?? ''),
                                'order_number' => $cData['order_number'] ?? ($cData['receipt_id'] ?? ''),
                                'bill_number' => $isProcessed ? $bNum : null,
                                'customer_name' => $cData['customer_name'] ?? '',
                                'customer_phone' => $cData['customer_phone'] ?? '',
                                'order_type' => $cData['order_type'] ?? 'Takeaway',
                                'table_number' => $cData['table_number'] ?? '',
                                'items' => $cData['items'] ?? [],
                                'subtotal' => $cData['subtotal'] ?? 0,
                                'tax_amount' => $cData['tax_amount'] ?? 0,
                                'total' => $cData['total'] ?? 0,
                                'paid_amount' => $cData['paid_amount'] ?? 0,
                                'balance' => $cData['balance'] ?? 0,
                                'payment_status' => $cData['payment_status'] ?? 'PAID',
                                'payment_method' => $cData['payment_method'] ?? 'ONLINE',
                                'created_at' => $cData['created_date_formatted'] ?? date('d/m/Y g:i:s a', (int)($cData['stored_at'] ?? time())),
                                'bill_url' => '/bill.php?id=' . urlencode($cData['order_number'] ?? ($cData['receipt_id'] ?? '')),
                            ]);
                            exit;
                        }
                    }
                }
            }
        }
    }

    echo json_encode([
        'ok' => false,
        'status' => 'not_found',
        'order_id' => $reqId,
        'message' => 'No active order found for the provided details.'
    ]);
    exit;
}

// Action: PUBLISH RECEIPT (POS publishes official thermal bill receipt)
if ($action === 'publish_receipt') {
    $rawReceipt = file_get_contents('php://input');
    $payload = json_decode($rawReceipt ?: '[]', true) ?: $_POST;

    $receiptId = preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)($payload['receipt_id'] ?? ($payload['order_id'] ?? '')));
    if ($receiptId === '') {
        $receiptId = 'REC-' . date('ymd-His') . '-' . mt_rand(100, 999);
    }

    $receiptsDir = $dataDir . '/receipts';
    if (!is_dir($receiptsDir)) {
        @mkdir($receiptsDir, 0755, true);
    }

    $retentionSeconds = 4 * 86400;
    $files = glob($receiptsDir . '/*.json');
    if ($files) {
        $cutoff = time() - $retentionSeconds;
        foreach ($files as $f) {
            if (filemtime($f) < $cutoff) @unlink($f);
        }
    }

    $payload['receipt_id'] = $receiptId;
    $payload['stored_at'] = time();
    $payload['expires_at'] = time() + $retentionSeconds;

    $filePath = $receiptsDir . '/' . $receiptId . '.json';
    @file_put_contents($filePath, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

    if (!empty($payload['order_number'])) {
        $aliasNum = preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)$payload['order_number']);
        if ($aliasNum !== '' && $aliasNum !== $receiptId) {
            @file_put_contents($receiptsDir . '/' . $aliasNum . '.json', json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        }
    }
    if (!empty($payload['bill_number'])) {
        $aliasBill = preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)$payload['bill_number']);
        if ($aliasBill !== '' && $aliasBill !== $receiptId) {
            @file_put_contents($receiptsDir . '/' . $aliasBill . '.json', json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
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

/**
 * Allocate sequential Token / Order Number matching FloCafe POS sequence (e.g. TOK-0001, TOK-0002)
 */
function getNextOrderNumber(string $dataDir): string {
    $candidateDirs = getCandidateDataDirs($dataDir);
    $today = date('Y-m-d');
    $prefix = 'TOK';
    $nextSeq = 1;

    // 1. Cross-check all candidate dirs for the latest sequence record
    foreach ($candidateDirs as $cDir) {
        $sFile = $cDir . '/order_sequence.json';
        if (file_exists($sFile)) {
            $raw = @file_get_contents($sFile);
            $data = json_decode($raw ?: '[]', true);
            if (is_array($data) && ($data['date'] ?? '') === $today) {
                $nextSeq = max($nextSeq, (int)($data['last_seq'] ?? 0) + 1);
                if (!empty($data['prefix'])) {
                    $prefix = $data['prefix'];
                }
            }
        }
    }

    // 2. Cross-check with live_data.json across all candidate dirs to ensure sequence is never below POS active/recent orders
    foreach ($candidateDirs as $cDir) {
        $liveFile = $cDir . '/live_data.json';
        if (file_exists($liveFile)) {
            $liveRaw = @file_get_contents($liveFile);
            $liveData = json_decode($liveRaw ?: '[]', true);
            if (is_array($liveData)) {
                if (!empty($liveData['active_orders']) && is_array($liveData['active_orders'])) {
                    foreach ($liveData['active_orders'] as $ao) {
                        if (!empty($ao['order_number']) && preg_match('/^TOK-(\d+)$/i', (string)$ao['order_number'], $m)) {
                            $nextSeq = max($nextSeq, (int)$m[1] + 1);
                        }
                    }
                }
                if (!empty($liveData['recent_bills']) && is_array($liveData['recent_bills'])) {
                    foreach ($liveData['recent_bills'] as $rb) {
                        if (!empty($rb['order_number']) && preg_match('/^TOK-(\d+)$/i', (string)$rb['order_number'], $m)) {
                            $nextSeq = max($nextSeq, (int)$m[1] + 1);
                        }
                    }
                }
            }
        }
    }

    // 3. Cross-check with pending orders across all candidate dirs
    foreach ($candidateDirs as $cDir) {
        $pendingFile = $cDir . '/pending_orders.json';
        if (file_exists($pendingFile)) {
            $penRaw = @file_get_contents($pendingFile);
            $penData = json_decode($penRaw ?: '[]', true);
            if (is_array($penData)) {
                foreach ($penData as $po) {
                    $pNum = $po['order_number'] ?? ($po['order_id'] ?? '');
                    if (preg_match('/^TOK-(\d+)$/i', (string)$pNum, $m)) {
                        $nextSeq = max($nextSeq, (int)$m[1] + 1);
                    }
                }
            }
        }
    }

    $orderNumber = $prefix . '-' . str_pad((string)$nextSeq, 4, '0', STR_PAD_LEFT);

    // Save updated sequence across all candidate directories
    $seqData = json_encode([
        'date' => $today,
        'last_seq' => $nextSeq,
        'prefix' => $prefix,
        'updated_at' => date('c'),
    ], JSON_PRETTY_PRINT);

    foreach ($candidateDirs as $cDir) {
        if (!is_dir($cDir)) {
            @mkdir($cDir, 0755, true);
        }
        @file_put_contents($cDir . '/order_sequence.json', $seqData, LOCK_EX);
    }

    return $orderNumber;
}

// ==========================================
// PUBLIC ENDPOINT 2: SUBMIT ORDER FROM WEBSITE
// ==========================================
if ($action === 'submit_order' || $action === 'order') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'Method Not Allowed. Use POST.']);
        exit;
    }

    $raw = file_get_contents('php://input');
    $payload = json_decode($raw ?: '[]', true) ?: $_POST;

    if (!is_array($payload) || empty($payload)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid order payload']);
        exit;
    }

    // 1. Verify dynamic store status (checks active POS heartbeat and manual open toggle)
    $dynamicStatus = resolveDynamicStoreStatus($dataDir, $config);
    if (!$dynamicStatus['store_open']) {
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'error' => $dynamicStatus['pos_online']
                ? 'Restaurant has temporarily paused online orders.'
                : 'Restaurant is currently closed (POS offline). Online orders are not accepted right now.',
            'store_open' => false,
            'pos_online' => $dynamicStatus['pos_online'],
        ]);
        exit;
    }

    // 2. Validate customer info
    $customerName = trim((string)($payload['customer_name'] ?? ($payload['name'] ?? '')));
    $customerPhone = preg_replace('/[^\d+]/', '', trim((string)($payload['customer_phone'] ?? ($payload['phone'] ?? ''))));
    $orderType = strtolower(trim((string)($payload['order_type'] ?? ($payload['orderType'] ?? 'takeaway'))));
    if ($orderType !== 'dine-in') {
        $orderType = 'takeaway';
    }
    $tableNumber = trim((string)($payload['table_number'] ?? ($payload['tableNumber'] ?? '')));
    $notes = trim((string)($payload['notes'] ?? ($payload['special_instructions'] ?? '')));
    $items = $payload['items'] ?? [];

    if ($customerName === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Customer name is required']);
        exit;
    }

    if ($customerPhone === '' || strlen(preg_replace('/\D/', '', $customerPhone)) < 10) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Valid 10-digit phone number is required for order updates']);
        exit;
    }

    if (!is_array($items) || count($items) === 0) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Order must contain at least one item']);
        exit;
    }

    // Payment details (Razorpay Online / Cash on Delivery)
    $paymentStatus = strtolower(trim((string)($payload['payment_status'] ?? ($payload['paymentStatus'] ?? 'unpaid'))));
    $paymentMethod = strtolower(trim((string)($payload['payment_method'] ?? ($payload['paymentMethod'] ?? 'cash'))));
    $paymentId = trim((string)($payload['payment_id'] ?? ($payload['paymentId'] ?? ($payload['razorpay_payment_id'] ?? ''))));
    $razorpayOrderId = trim((string)($payload['razorpay_order_id'] ?? ''));
    $razorpaySignature = trim((string)($payload['razorpay_signature'] ?? ''));

    $isPaid = ($paymentStatus === 'paid') || ($paymentId !== '');
    if ($isPaid) {
        $paymentStatus = 'paid';
        if ($paymentMethod === 'cash') {
            $paymentMethod = 'online';
        }
    }

    // Online orders from website do not require a table
    if ($tableNumber === '') {
        $tableNumber = '';
    }

    // 3. Validate stock if catalog exists (only block if payment hasn't already been completed)
    $menuFile = $dataDir . '/menu_catalog.json';
    if (!$isPaid && file_exists($menuFile)) {
        $menuRaw = @file_get_contents($menuFile);
        $menuData = json_decode($menuRaw ?: '[]', true);
        if (is_array($menuData) && !empty($menuData['items'])) {
            $catalogMap = [];
            foreach ($menuData['items'] as $it) {
                if (!empty($it['id'])) $catalogMap[(string)$it['id']] = $it;
                if (!empty($it['name'])) $catalogMap[strtolower(trim($it['name']))] = $it;
            }

            foreach ($items as $reqItem) {
                $itemId = (string)($reqItem['id'] ?? '');
                $itemName = strtolower(trim((string)($reqItem['name'] ?? '')));
                $catItem = $catalogMap[$itemId] ?? ($catalogMap[$itemName] ?? null);

                if ($catItem) {
                    if (isset($catItem['stock_status']) && $catItem['stock_status'] === 'out_of_stock') {
                        http_response_code(400);
                        echo json_encode([
                            'ok' => false,
                            'error' => "Sorry, \"{$catItem['name']}\" is currently out of stock. Please remove it from your cart.",
                            'out_of_stock_item' => $catItem['name'],
                        ]);
                        exit;
                    }
                }
            }
        }
    }

    // 4. Generate sequential Token / Order Number matching FloCafe POS format (e.g. TOK-0009)
    $orderNumber = getNextOrderNumber($dataDir);
    // Globally unique order ID for idempotency and backend tracking (e.g. WEB-261120-110509-0009)
    $cleanNum = preg_replace('/\D/', '', $orderNumber);
    $orderId = 'WEB-' . date('ymd-His') . '-' . str_pad($cleanNum, 4, '0', STR_PAD_LEFT);

    // Calculate totals
    $subtotal = 0;
    $sanitizedItems = [];
    foreach ($items as $idx => $it) {
        $qty = max(1, (int)($it['quantity'] ?? 1));
        $price = (float)($it['price'] ?? 0);
        $lineTotal = round($qty * $price, 2);
        $subtotal += $lineTotal;

        $sanitizedItems[] = [
            'id' => (string)($it['id'] ?? ('item-' . ($idx + 1))),
            'name' => (string)($it['name'] ?? 'Item'),
            'price' => $price,
            'quantity' => $qty,
            'total' => $lineTotal,
            'notes' => trim((string)($it['instructions'] ?? ($it['notes'] ?? ''))),
        ];
    }

    // In Five Star POS, menu prices are inclusive of 5% GST; grand total matches menu prices
    $deliveryFee = 0.0;
    $grandTotal = isset($payload['total']) && (float)$payload['total'] > 0
        ? round((float)$payload['total'], 2)
        : round($subtotal, 2);
    // 5% GST included component (Tax = Total - Total / 1.05)
    $taxAmount = round($grandTotal - ($grandTotal / 1.05), 2);

    $newOrder = [
        'order_id' => $orderId,
        'order_number' => $orderNumber,
        'source' => 'website',
        'status' => 'pending',
        'created_at' => date('c'),
        'customer' => [
            'name' => $customerName,
            'phone' => $customerPhone,
            'address' => '',
        ],
        'order_type' => $orderType,
        'table_number' => $tableNumber,
        'special_instructions' => $notes,
        'items' => $sanitizedItems,
        'subtotal' => $subtotal,
        'tax_amount' => $taxAmount,
        'delivery_fee' => $deliveryFee,
        'total' => $grandTotal,
        'payment_status' => $paymentStatus,
        'payment_method' => $paymentMethod,
        'payment_id' => $paymentId,
        'paid_amount' => $isPaid ? $grandTotal : 0.0,
        'razorpay_order_id' => $razorpayOrderId,
        'razorpay_signature' => $razorpaySignature,
    ];

    // Atomically append into data/pending_orders.json across all candidate directories
    $candidateDirs = getCandidateDataDirs($dataDir);
    foreach ($candidateDirs as $cDir) {
        if (!is_dir($cDir)) {
            @mkdir($cDir, 0755, true);
        }
        $pendingOrdersFile = $cDir . '/pending_orders.json';
        $fp = fopen($pendingOrdersFile, 'c+');
        if ($fp && flock($fp, LOCK_EX)) {
            $rawExisting = stream_get_contents($fp);
            $existing = json_decode($rawExisting ?: '[]', true);
            if (!is_array($existing)) $existing = [];
            $alreadyPresent = false;
            foreach ($existing as $ex) {
                if (($ex['order_id'] ?? '') === $orderId) {
                    $alreadyPresent = true;
                    break;
                }
            }
            if (!$alreadyPresent) {
                $existing[] = $newOrder;
            }
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            fflush($fp);
            flock($fp, LOCK_UN);
            fclose($fp);
        }
    }

    // Auto-save digital receipt so link works immediately across all candidate dirs
    $retentionSeconds = 4 * 86400;
    $initialReceipt = [
        'receipt_id' => $orderId,
        'order_number' => $orderNumber,
        'bill_number' => 'Processing (POS Synced)',
        'online_order_id' => $orderId,
        'customer_name' => $customerName,
        'customer_phone' => $customerPhone,
        'order_type' => ucfirst($orderType),
        'table_number' => $tableNumber,
        'created_date_formatted' => date('d/m/Y g:i:s a'),
        'items' => $sanitizedItems,
        'subtotal' => $subtotal,
        'tax_amount' => $taxAmount,
        'delivery_charge' => 0.0,
        'total' => $grandTotal,
        'paid_amount' => $isPaid ? $grandTotal : 0.0,
        'balance' => $isPaid ? 0.0 : $grandTotal,
        'payment_status' => strtoupper($paymentStatus),
        'payment_method' => strtoupper($paymentMethod),
        'payment_id' => $paymentId,
        'store_name' => 'Five Star',
        'store_address' => 'BH Rd, Binnamangala, Nelmangala.',
        'store_phone' => '+919886426278',
        'stored_at' => time(),
        'expires_at' => time() + $retentionSeconds,
    ];
    foreach ($candidateDirs as $cDir) {
        $rDir = $cDir . '/receipts';
        if (!is_dir($rDir)) {
            @mkdir($rDir, 0755, true);
        }
        @file_put_contents($rDir . '/' . $orderId . '.json', json_encode($initialReceipt, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        if ($orderNumber !== $orderId) {
            @file_put_contents($rDir . '/' . $orderNumber . '.json', json_encode($initialReceipt, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        }
    }

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? 'fivestarnelamangala.in';
    $billUrl = $protocol . $host . '/bill.php?id=' . urlencode($orderNumber);

    echo json_encode([
        'ok' => true,
        'order_id' => $orderId,
        'order_number' => $orderNumber,
        'bill_url' => $billUrl,
        'message' => 'Order submitted successfully! Sent to kitchen for KOT generation and bill dispatch.',
        'order' => $newOrder,
    ]);
    exit;
}

// Setup session for dashboard PIN login
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
        'has_data' => file_exists($config['data_file'] ?? ($dataDir . '/live_data.json'))
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
