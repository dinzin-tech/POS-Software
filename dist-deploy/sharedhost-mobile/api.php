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

// ==========================================
// PUBLIC ENDPOINT 1: FETCH DYNAMIC MENU & STORE STATUS
// ==========================================
if ($action === 'menu') {
    $menuFile = $dataDir . '/menu_catalog.json';
    $statusFile = $dataDir . '/store_status.json';

    $storeOpen = true;
    $statusText = 'Open Now';
    $statusMessage = '';
    $openingHours = null;

    if (file_exists($statusFile)) {
        $statusRaw = @file_get_contents($statusFile);
        $statusData = json_decode($statusRaw ?: '[]', true);
        if (is_array($statusData)) {
            $storeOpen = !empty($statusData['is_open']);
            $statusText = $statusData['status_text'] ?? ($storeOpen ? 'Open Now' : 'Closed');
            $statusMessage = $statusData['message'] ?? '';
            $openingHours = $statusData['opening_hours'] ?? null;
        }
    }

    $catalog = [
        'ok' => true,
        'store_open' => $storeOpen,
        'status_text' => $statusText,
        'message' => $statusMessage,
        'opening_hours' => $openingHours,
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

        // Check completed orders history
        $completedFile = $dataDir . '/completed_orders.json';
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

        // Check pending orders
        $pendingFile = $dataDir . '/pending_orders.json';
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
    $seqFile = $dataDir . '/order_sequence.json';
    $today = date('Y-m-d');
    $prefix = 'TOK';
    $nextSeq = 1;

    $fp = fopen($seqFile, 'c+');
    if ($fp && flock($fp, LOCK_EX)) {
        $raw = stream_get_contents($fp);
        $data = json_decode($raw ?: '[]', true);
        if (is_array($data)) {
            if (($data['date'] ?? '') === $today) {
                $nextSeq = max(1, (int)($data['last_seq'] ?? 0) + 1);
            }
            if (!empty($data['prefix'])) {
                $prefix = $data['prefix'];
            }
        }

        // Cross-check with live_data.json to ensure sequence is never below POS active/recent orders
        $liveFile = $dataDir . '/live_data.json';
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

        // Cross-check with pending orders
        $pendingFile = $dataDir . '/pending_orders.json';
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

        $orderNumber = $prefix . '-' . str_pad((string)$nextSeq, 4, '0', STR_PAD_LEFT);

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode([
            'date' => $today,
            'last_seq' => $nextSeq,
            'prefix' => $prefix,
            'updated_at' => date('c'),
        ], JSON_PRETTY_PRINT));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        return $orderNumber;
    }

    return 'TOK-' . str_pad((string)mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
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

    // 1. Verify store status
    $statusFile = $dataDir . '/store_status.json';
    if (file_exists($statusFile)) {
        $statusRaw = @file_get_contents($statusFile);
        $statusData = json_decode($statusRaw ?: '[]', true);
        if (is_array($statusData) && isset($statusData['is_open']) && !$statusData['is_open']) {
            http_response_code(400);
            echo json_encode([
                'ok' => false,
                'error' => 'Restaurant is currently closed and not accepting online orders at this moment.',
                'store_open' => false,
            ]);
            exit;
        }
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

    if ($orderType === 'dine-in' && $tableNumber === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Please provide table number for dine-in orders']);
        exit;
    }

    // 3. Validate stock if catalog exists
    $menuFile = $dataDir . '/menu_catalog.json';
    if (file_exists($menuFile)) {
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
    $orderId = $orderNumber;

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

    // Atomically append into data/pending_orders.json
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0755, true);
    }
    $pendingOrdersFile = $dataDir . '/pending_orders.json';
    $fp = fopen($pendingOrdersFile, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Order queue is temporarily busy. Please try again.']);
        exit;
    }

    $rawExisting = stream_get_contents($fp);
    $existing = json_decode($rawExisting ?: '[]', true);
    if (!is_array($existing)) $existing = [];
    $existing[] = $newOrder;

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    // Auto-save digital receipt so link works immediately
    $receiptsDir = $dataDir . '/receipts';
    if (!is_dir($receiptsDir)) {
        @mkdir($receiptsDir, 0755, true);
    }
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
        'store_address' => 'Lohith Nagara, Nelmangala.',
        'store_phone' => '+919353333945',
        'stored_at' => time(),
        'expires_at' => time() + $retentionSeconds,
    ];
    @file_put_contents($receiptsDir . '/' . $orderId . '.json', json_encode($initialReceipt, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? 'fivestarnelamangala.in';
    $billUrl = $protocol . $host . '/bill.php?id=' . urlencode($orderId);

    echo json_encode([
        'ok' => true,
        'order_id' => $orderId,
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
