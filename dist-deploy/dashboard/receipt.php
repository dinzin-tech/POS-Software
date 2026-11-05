<?php
/**
 * DinZin POS / Five Star Chicken - Digital Bill & Thermal Receipt Viewer
 * Displays authentic digital receipt matching POS 80mm thermal printer output.
 * Retains receipts for 4 days and automatically deletes expired records.
 */

declare(strict_types=1);

// Prevent caching so live updates & 4-day deletion take effect immediately
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// 1. Determine data directory
$baseDir = __DIR__;
$candidateDirs = [
    $baseDir . '/data/receipts',
    $baseDir . '/dashboard/data/receipts',
    $baseDir . '/../dashboard/data/receipts',
    $baseDir . '/../data/receipts',
];

$receiptsDir = null;
foreach ($candidateDirs as $dir) {
    if (is_dir($dir)) {
        $receiptsDir = $dir;
        break;
    }
}

if (!$receiptsDir) {
    $receiptsDir = is_dir($baseDir . '/dashboard/data') 
        ? $baseDir . '/dashboard/data/receipts' 
        : $baseDir . '/data/receipts';
    @mkdir($receiptsDir, 0755, true);
}

// Ensure .htaccess inside receipts dir protects against raw directory indexing
$dataDir = dirname($receiptsDir);
$htaccessFile = $dataDir . '/.htaccess';
if (!file_exists($htaccessFile)) {
    @file_put_contents($htaccessFile, "Order Allow,Deny\nDeny from all\n<FilesMatch \"\.(php)$\">\nAllow from all\n</FilesMatch>\n");
}

// 2. Auto-Clean Expired Receipts (Retention: 4 Days = 345,600 Seconds)
$retentionSeconds = 4 * 86400;
$cutoffTime = time() - $retentionSeconds;

if (is_dir($receiptsDir)) {
    $allReceiptFiles = glob($receiptsDir . '/*.json');
    if ($allReceiptFiles) {
        foreach ($allReceiptFiles as $file) {
            $mtime = @filemtime($file);
            if ($mtime && $mtime < $cutoffTime) {
                @unlink($file);
            }
        }
    }
}

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($action === 'publish_receipt' || ($requestMethod === 'POST' && isset($_GET['publish']))) {
    header('Content-Type: application/json; charset=utf-8');
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput ?: '[]', true) ?: $_POST;

    $receiptId = preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)($payload['receipt_id'] ?? ($payload['order_id'] ?? ($payload['id'] ?? ''))));
    if ($receiptId === '') {
        $receiptId = 'REC-' . date('ymd-His') . '-' . mt_rand(100, 999);
    }

    $payload['receipt_id'] = $receiptId;
    $payload['stored_at'] = time();
    $payload['expires_at'] = time() + $retentionSeconds;

    $filePath = $receiptsDir . '/' . $receiptId . '.json';
    @file_put_contents($filePath, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

    // Also alias by order_number if provided (e.g. TOK-0005)
    if (!empty($payload['order_number'])) {
        $aliasId = preg_replace('/[^a-zA-Z0-9_\-]/', '', (string)$payload['order_number']);
        if ($aliasId !== '' && $aliasId !== $receiptId) {
            @file_put_contents($receiptsDir . '/' . $aliasId . '.json', json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        }
    }

    // Also alias by bill_number if provided (e.g. INVOICE-0041)
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

// 4. Handle Receipt Retrieval & Rendering
$rawId = trim((string)($_GET['id'] ?? ($_GET['receipt'] ?? ($_GET['order'] ?? ''))));
$id = preg_replace('/[^a-zA-Z0-9_\-]/', '', $rawId);

$receiptData = null;
$isExpired = false;

if ($id !== '') {
    $receiptFile = $receiptsDir . '/' . $id . '.json';
    if (file_exists($receiptFile)) {
        $mtime = @filemtime($receiptFile);
        if ($mtime && $mtime < $cutoffTime) {
            @unlink($receiptFile);
            $isExpired = true;
        } else {
            $rawContent = @file_get_contents($receiptFile);
            $decoded = json_decode($rawContent ?: '[]', true);
            if (is_array($decoded) && !empty($decoded)) {
                $receiptData = $decoded;
            }
        }
    } else {
        // Also check if id is in pending_orders or completed_orders
        $dataParent = dirname($receiptsDir);
        $orderFiles = [$dataParent . '/pending_orders.json', $dataParent . '/completed_orders.json'];
        foreach ($orderFiles as $oFile) {
            if (file_exists($oFile)) {
                $orders = json_decode(@file_get_contents($oFile) ?: '[]', true);
                if (is_array($orders)) {
                    foreach ($orders as $ord) {
                        $matchId = (string)($ord['order_id'] ?? ($ord['id'] ?? ''));
                        $matchNum = (string)($ord['order_number'] ?? '');
                        if ($matchId === $id || $matchNum === $id || str_replace('-', '', $matchId) === str_replace('-', '', $id)) {
                            // Synthesize receipt data
                            $receiptData = [
                                'receipt_id' => $matchId,
                                'order_number' => $ord['order_number'] ?? 'ONLINE',
                                'bill_number' => $ord['bill_number'] ?? ('INV-' . substr($matchId, -6)),
                                'online_order_id' => $matchId,
                                'customer_name' => $ord['customer']['name'] ?? ($ord['customer_name'] ?? 'Valued Customer'),
                                'customer_phone' => $ord['customer']['phone'] ?? ($ord['customer_phone'] ?? ''),
                                'order_type' => ucfirst((string)($ord['order_type'] ?? 'Takeaway')),
                                'table_number' => $ord['table_number'] ?? '',
                                'created_date_formatted' => !empty($ord['created_at']) ? date('d/m/Y g:i:s a', strtotime($ord['created_at'])) : date('d/m/Y g:i:s a'),
                                'items' => $ord['items'] ?? [],
                                'subtotal' => $ord['subtotal'] ?? $ord['total'],
                                'tax_amount' => $ord['tax_amount'] ?? 0,
                                'delivery_charge' => $ord['delivery_charge'] ?? ($ord['delivery_fee'] ?? 0),
                                'total' => $ord['total'] ?? 0,
                                'paid_amount' => ($ord['payment_status'] ?? '') === 'paid' ? ($ord['total'] ?? 0) : 0,
                                'balance' => ($ord['payment_status'] ?? '') === 'paid' ? 0 : ($ord['total'] ?? 0),
                                'payment_status' => strtoupper((string)($ord['payment_status'] ?? 'UNPAID')),
                                'payment_method' => strtoupper((string)($ord['payment_method'] ?? 'CASH')),
                                'payment_id' => $ord['payment_id'] ?? '',
                                'store_name' => 'Five Star',
                                'store_address' => 'Lohith Nagara, Nelmangala.',
                                'store_phone' => '+919353333945',
                            ];
                            break 2;
                        }
                    }
                }
            }
        }
    }
    if (!$receiptData && $id !== '') {
        $isExpired = true;
    }
}

// Variables for display
$storeName = $receiptData['store_name'] ?? 'Five Star';
$storeAddress = $receiptData['store_address'] ?? 'Lohith Nagara, Nelmangala.';
$storePhone = $receiptData['store_phone'] ?? '+919353333945';
$orderNumber = $receiptData['order_number'] ?? ($id ?: 'ONLINE');
$billNumber = $receiptData['bill_number'] ?? ('INV-' . substr(md5($id ?: '1'), 0, 4));
$onlineOrderId = $receiptData['online_order_id'] ?? ($receiptData['receipt_id'] ?? $id);
$customerName = $receiptData['customer_name'] ?? 'Customer';
$customerPhone = $receiptData['customer_phone'] ?? '';
$orderType = $receiptData['order_type'] ?? 'Takeaway';
$tableNumber = $receiptData['table_number'] ?? '';
$dateFormatted = $receiptData['created_date_formatted'] ?? date('d/m/Y g:i:s a');

$items = $receiptData['items'] ?? [];
$subtotal = (float)($receiptData['subtotal'] ?? 0);
$taxAmount = (float)($receiptData['tax_amount'] ?? 0);
$total = (float)($receiptData['total'] ?? ($subtotal + $taxAmount));
$paidAmount = (float)($receiptData['paid_amount'] ?? 0);
$balance = (float)($receiptData['balance'] ?? max(0, $total - $paidAmount));
$paymentStatus = strtoupper((string)($receiptData['payment_status'] ?? ($paidAmount >= $total ? 'PAID' : 'UNPAID')));
$paymentMethod = strtoupper((string)($receiptData['payment_method'] ?? 'CASH'));
$paymentId = (string)($receiptData['payment_id'] ?? '');

$isPaidInFull = ($paymentStatus === 'PAID') || ($paidAmount >= $total && $total > 0);

?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Official Bill Receipt - <?php echo htmlspecialchars($storeName); ?> #<?php echo htmlspecialchars($orderNumber); ?></title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0c0a09;
      --card-bg: #ffffff;
      --text: #1c1917;
      --text-muted: #57534e;
      --red: #d93829;
      --gold: #f5c542;
      --green: #15803d;
      --border: #e7e5e4;
      --paper-edge: #f5f5f4;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 80px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .page-container {
      width: 100%;
      max-width: 440px;
      margin: 0 auto;
    }
    /* Brand Header */
    .top-brand {
      text-align: center;
      margin-bottom: 20px;
    }
    .top-brand .emblem {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d93829 0%, #991b1b 100%);
      color: #fff;
      font-weight: 800;
      font-size: 24px;
      box-shadow: 0 4px 20px rgba(217, 56, 41, 0.4);
      margin-bottom: 8px;
    }
    .top-brand h1 {
      color: #fafaf9;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .top-brand p {
      color: #a8a29e;
      font-size: 12px;
      font-family: 'Space Mono', monospace;
      margin-top: 2px;
    }

    /* Thermal Receipt Card */
    .receipt-wrapper {
      position: relative;
      background: var(--card-bg);
      border-radius: 8px 8px 0 0;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
      overflow: hidden;
    }
    .receipt-content {
      padding: 24px 22px 20px 22px;
      font-family: 'Space Mono', monospace;
      font-size: 13px;
      line-height: 1.45;
      color: #111827;
    }
    /* Jagged Bottom Paper Edge */
    .paper-jagged {
      height: 12px;
      background: radial-gradient(circle, transparent, transparent 50%, var(--card-bg) 50%, var(--card-bg) 100%);
      background-size: 16px 16px;
      background-position: -8px -8px;
      margin-top: -1px;
    }

    .dashed-line {
      border-top: 1px dashed #9ca3af;
      margin: 10px 0;
    }
    .double-dashed-line {
      border-top: 2px dashed #4b5563;
      margin: 12px 0;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: 700; }
    .uppercase { text-transform: uppercase; }

    .header-banner {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }
    .source-tag {
      font-size: 12px;
      color: #4b5563;
    }
    .order-ref {
      font-size: 12px;
      margin-top: 2px;
      color: #1f2937;
    }
    .store-title {
      font-size: 18px;
      font-weight: 700;
      margin: 6px 0 2px 0;
      letter-spacing: 0.02em;
    }
    .customer-line {
      font-size: 14px;
      font-weight: 700;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
      font-size: 12px;
    }

    /* Items Table */
    .items-header {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 12px;
      padding: 2px 0;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin: 6px 0;
      font-size: 12px;
    }
    .item-col-name {
      flex: 1;
      padding-right: 8px;
      word-break: break-word;
    }
    .item-col-qty {
      width: 32px;
      text-align: center;
      font-weight: 700;
    }
    .item-col-amount {
      width: 75px;
      text-align: right;
      font-weight: 700;
    }

    /* Totals Breakdown */
    .calc-row {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
      font-size: 12px;
    }
    .calc-row.grand-total {
      font-size: 15px;
      font-weight: 700;
      margin: 6px 0;
      color: #000;
    }
    .calc-row.paid-row {
      color: #15803d;
      font-weight: 700;
    }

    /* Status Badge */
    .status-badge-container {
      margin: 12px 0 6px 0;
      text-align: center;
    }
    .badge-paid {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .badge-unpaid {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    /* Store Footer */
    .receipt-footer {
      text-align: center;
      margin-top: 10px;
      font-size: 11px;
      color: #4b5563;
      line-height: 1.5;
    }
    .powered-by {
      margin-top: 10px;
      font-size: 10px;
      color: #6b7280;
      text-align: center;
    }

    /* Floating Action Buttons */
    .actions-bar {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 18px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
      width: 100%;
    }
    .btn-primary {
      background: #d93829;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(217, 56, 41, 0.3);
    }
    .btn-primary:hover {
      background: #b91c1c;
    }
    .btn-secondary {
      background: #262626;
      color: #fafaf9;
      border: 1px solid #404040;
    }
    .btn-secondary:hover {
      background: #333333;
    }
    .btn-whatsapp {
      background: #25d366;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
    }
    .btn-whatsapp:hover {
      background: #1eb857;
    }

    /* Retention Notice */
    .retention-tag {
      text-align: center;
      color: #78716c;
      font-size: 11px;
      font-family: 'Space Mono', monospace;
      margin-top: 14px;
      line-height: 1.4;
    }

    /* Expired Card */
    .expired-box {
      background: #1c1917;
      border: 1px solid #44403c;
      border-radius: 12px;
      padding: 32px 24px;
      text-align: center;
      color: #fafaf9;
    }
    .expired-icon {
      font-size: 40px;
      margin-bottom: 12px;
    }
    .expired-box h2 {
      font-size: 18px;
      margin-bottom: 8px;
      color: #f5c542;
    }
    .expired-box p {
      font-size: 13px;
      color: #a8a29e;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    /* Print Styles */
    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
        color: #000 !important;
      }
      .top-brand, .actions-bar, .retention-tag, .paper-jagged {
        display: none !important;
      }
      .receipt-wrapper {
        box-shadow: none !important;
        border: none !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      .receipt-content {
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>

<div class="page-container">

  <!-- Top Restaurant Emblem -->
  <div class="top-brand">
    <div class="emblem">5★</div>
    <h1>Five Star Chicken</h1>
    <p>Official Digital Receipt</p>
  </div>

  <?php if ($isExpired): ?>
    <div class="expired-box">
      <div class="expired-icon">⏳</div>
      <h2>Digital Receipt Expired</h2>
      <p>
        This receipt was created over <strong>4 days ago</strong> and has been securely purged per our 4-day retention policy.
      </p>
      <p>
        If you need an invoice copy for accounting, please contact Five Star Chicken Nelamangala at <strong>+91 93533 33945</strong>.
      </p>
      <a href="/" class="btn btn-secondary">← Back to Five Star Website</a>
    </div>

  <?php elseif (!$receiptData && $id === ''): ?>
    <div class="expired-box">
      <div class="expired-icon">🧾</div>
      <h2>Receipt Lookup</h2>
      <p>Please enter your Order # or Invoice # from your WhatsApp confirmation.</p>
      <form method="GET" action="bill.php" style="margin-top: 14px;">
        <input type="text" name="id" placeholder="e.g. TOK-0005 or WEB-..." required
               style="width: 100%; padding: 10px; font-size: 14px; font-family: monospace; border-radius: 4px; border: 1px solid #57534e; background: #0c0a09; color: #fff; text-align: center; margin-bottom: 10px;">
        <button type="submit" class="btn btn-primary">View Bill Receipt</button>
      </form>
    </div>

  <?php else: ?>

    <!-- Thermal Paper Receipt -->
    <div class="receipt-wrapper">
      <div class="receipt-content">

        <!-- Receipt Header Matching 80mm Preview -->
        <div class="text-center header-banner">** <?php echo htmlspecialchars(strtoupper($orderType)); ?> ORDER **</div>
        <div class="text-center source-tag"><?php echo htmlspecialchars(!empty($receiptData['source']) ? $receiptData['source'] : 'website'); ?></div>
        <?php if (!empty($onlineOrderId) && $onlineOrderId !== $orderNumber): ?>
          <div class="text-center order-ref">Ref: #<?php echo htmlspecialchars($onlineOrderId); ?></div>
        <?php else: ?>
          <div class="text-center order-ref">TOKEN #<?php echo htmlspecialchars($orderNumber); ?></div>
        <?php endif; ?>

        <div class="text-center store-title"><?php echo htmlspecialchars($storeName); ?></div>
        <?php if (!empty($customerName)): ?>
          <div class="text-center customer-line"><?php echo htmlspecialchars($customerName); ?></div>
        <?php endif; ?>

        <div class="dashed-line"></div>

        <!-- Order & Invoice Meta -->
        <div class="meta-row">
          <span>Order #<?php echo htmlspecialchars($orderNumber); ?></span>
          <?php if (!empty($tableNumber)): ?>
            <span class="bold">Table: <?php echo htmlspecialchars($tableNumber); ?></span>
          <?php endif; ?>
        </div>
        <div class="meta-row">
          <span>Invoice #: <?php echo htmlspecialchars($billNumber); ?></span>
        </div>
        <div class="meta-row">
          <span><?php echo htmlspecialchars($dateFormatted); ?></span>
        </div>

        <div class="dashed-line"></div>

        <!-- Items Table Header -->
        <div class="items-header">
          <span class="item-col-name">Item</span>
          <span class="item-col-qty">Qty</span>
          <span class="item-col-amount">Amount</span>
        </div>

        <div class="dashed-line"></div>

        <!-- Items Rows -->
        <?php if (!empty($items)): ?>
          <?php foreach ($items as $it): 
            $iName = (string)($it['name'] ?? 'Item');
            $iQty = (int)($it['quantity'] ?? 1);
            $iPrice = (float)($it['price'] ?? 0);
            $iTotal = (float)($it['total'] ?? ($iPrice * $iQty));
          ?>
            <div class="item-row">
              <span class="item-col-name"><?php echo htmlspecialchars($iName); ?></span>
              <span class="item-col-qty"><?php echo $iQty; ?></span>
              <span class="item-col-amount">Rs<?php echo number_format($iTotal, 2, '.', ''); ?></span>
            </div>
          <?php endforeach; ?>
        <?php else: ?>
          <div class="item-row">
            <span class="item-col-name">Order Food Items</span>
            <span class="item-col-qty">1</span>
            <span class="item-col-amount">Rs<?php echo number_format($subtotal ?: $total, 2, '.', ''); ?></span>
          </div>
        <?php endif; ?>

        <div class="dashed-line"></div>

        <!-- Subtotal / Tax / Total -->
        <div class="calc-row">
          <span>Net Amount</span>
          <span>Rs<?php echo number_format($total - $taxAmount, 2, '.', ''); ?></span>
        </div>
        <?php if ($taxAmount > 0): ?>
          <div class="calc-row">
            <span>GST 5% (Included)</span>
            <span>Rs<?php echo number_format($taxAmount, 2, '.', ''); ?></span>
          </div>
        <?php endif; ?>

        <div class="calc-row grand-total">
          <span>TOTAL</span>
          <span>Rs<?php echo number_format($total, 2, '.', ''); ?></span>
        </div>

        <div class="dashed-line"></div>

        <!-- Payment Settlement -->
        <?php if ($isPaidInFull): ?>
          <div class="calc-row paid-row">
            <span><?php echo ($paymentMethod === 'ONLINE' || !empty($paymentId)) ? 'Online (Razorpay)' : 'Cash'; ?></span>
            <span>Rs<?php echo number_format($paidAmount ?: $total, 2, '.', ''); ?></span>
          </div>
          <?php if (!empty($paymentId)): ?>
            <div class="calc-row" style="font-size: 11px; color: #4b5563;">
              <span>Ref ID</span>
              <span><?php echo htmlspecialchars($paymentId); ?></span>
            </div>
          <?php endif; ?>
          <div class="calc-row paid-row">
            <span>Balance</span>
            <span>Rs0.00</span>
          </div>
          <div class="status-badge-container">
            <span class="badge-paid">✓ PAID IN FULL</span>
          </div>
        <?php else: ?>
          <div class="calc-row">
            <span>Payment Mode</span>
            <span>Pay at Counter</span>
          </div>
          <div class="calc-row" style="color: #b45309; font-weight: 700;">
            <span>Balance Due</span>
            <span>Rs<?php echo number_format($balance ?: $total, 2, '.', ''); ?></span>
          </div>
          <div class="status-badge-container">
            <span class="badge-unpaid">⏳ PAYMENT DUE AT COUNTER</span>
          </div>
        <?php endif; ?>

        <div class="dashed-line"></div>

        <!-- Store Address & Phone -->
        <div class="receipt-footer">
          <div><?php echo htmlspecialchars($storeAddress); ?></div>
          <div>Ph: <?php echo htmlspecialchars($storePhone); ?></div>
        </div>

        <!-- Powered By -->
        <div class="powered-by">
          Powered by DinZin (dinzin.in)
        </div>

      </div>
    </div>
    <!-- Jagged Receipt Cut Edge -->
    <div class="paper-jagged"></div>

    <!-- Action Buttons -->
    <div class="actions-bar">
      <button onclick="window.print()" class="btn btn-primary">
        🖨️ Print / Save Receipt (PDF)
      </button>

      <a href="https://wa.me/919353333945?text=<?php echo urlencode('Hi Five Star Chicken, regarding order #' . $orderNumber . ' (' . $billNumber . ')'); ?>" 
         target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
        💬 Message Restaurant on WhatsApp
      </a>

      <a href="/" class="btn btn-secondary">
        🍗 Order More from Menu
      </a>
    </div>

    <div class="retention-tag">
      🔒 Secure Official Digital Receipt • Stored for 4 days from order time
    </div>

  <?php endif; ?>

</div>

</body>
</html>
