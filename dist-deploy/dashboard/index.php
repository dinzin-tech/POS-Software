<?php
/**
 * DinZin POS - Mobile Real-Time Analytics Dashboard
 * Premium Mobile-First PWA Dashboard for Shared Hosting
 */

declare(strict_types=1);

$configFile = __DIR__ . '/config.php';
$config = file_exists($configFile) ? require $configFile : [];
$storeName = htmlspecialchars($config['store_name'] ?? 'FloCafe POS', ENT_QUOTES, 'UTF-8');
$hasPin = !empty($config['dashboard_pin']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#090d16">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="<?= $storeName ?>">
  <meta name="description" content="Real-Time Mobile Sales & Analytics for <?= $storeName ?>">
  <title><?= $storeName ?> • Live Analytics</title>

  <!-- Google Fonts: Inter & Outfit -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-base: #070a11;
      --bg-surface: #0f1626;
      --bg-surface-elevated: #162036;
      --bg-card: rgba(18, 26, 44, 0.75);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-active: rgba(99, 102, 241, 0.4);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --brand: #6366f1;
      --brand-glow: rgba(99, 102, 241, 0.25);
      --brand-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      --emerald: #10b981;
      --emerald-glow: rgba(16, 185, 129, 0.25);
      --amber: #f59e0b;
      --rose: #f43f5e;
      --cyan: #06b6d4;
      --purple: #a855f7;
      --radius-lg: 20px;
      --radius-md: 14px;
      --radius-sm: 10px;
      --shadow-card: 0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      --shadow-glow: 0 0 35px -5px var(--brand-glow);
      --safe-top: env(safe-area-inset-top, 0px);
      --safe-bottom: env(safe-area-inset-bottom, 0px);
    }

    [data-theme="light"] {
      --bg-base: #f1f5f9;
      --bg-surface: #ffffff;
      --bg-surface-elevated: #f8fafc;
      --bg-card: rgba(255, 255, 255, 0.85);
      --border-subtle: rgba(0, 0, 0, 0.07);
      --border-active: rgba(99, 102, 241, 0.35);
      --text-main: #0f172a;
      --text-muted: #475569;
      --text-dim: #94a3b8;
      --shadow-card: 0 10px 25px -10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-base);
      color: var(--text-main);
      min-height: 100vh;
      min-height: -webkit-fill-available;
      overflow-x: hidden;
      padding-top: var(--safe-top);
      padding-bottom: calc(var(--safe-bottom) + 80px);
      line-height: 1.5;
      letter-spacing: -0.01em;
    }

    /* Ambient Background Glow */
    .bg-glow {
      position: fixed;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100vw;
      max-width: 600px;
      height: 380px;
      background: radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.06) 50%, transparent 80%);
      pointer-events: none;
      z-index: 0;
    }

    .app-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 580px;
      margin: 0 auto;
      padding: 16px 18px;
    }

    /* Header */
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-top: 6px;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 44px;
      height: 44px;
      border-radius: 13px;
      background: var(--brand-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 4px 14px var(--brand-glow);
    }

    .brand-titles h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.2;
      color: var(--text-main);
    }

    .brand-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }

    .live-indicator {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.15);
      color: var(--emerald);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--emerald);
      box-shadow: 0 0 8px var(--emerald);
      animation: pulseDot 2s infinite ease-in-out;
    }

    .live-indicator.offline {
      background: rgba(244, 63, 94, 0.15);
      color: var(--rose);
      border-color: rgba(244, 63, 94, 0.3);
    }
    .live-indicator.offline .live-dot {
      background: var(--rose);
      box-shadow: 0 0 8px var(--rose);
      animation: none;
    }

    @keyframes pulseDot {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.5; }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-icon {
      width: 38px;
      height: 38px;
      border-radius: 11px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 16px;
    }

    .btn-icon:active {
      transform: scale(0.92);
      color: var(--text-main);
      border-color: var(--brand);
    }

    .btn-icon.spinning svg {
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    /* Date and Sync pill */
    .status-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 16px;
    }

    .status-strip strong {
      color: var(--text-main);
      font-weight: 600;
    }

    /* Hero Net Sales Card */
    .hero-card {
      background: var(--bg-card);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 22px 20px;
      box-shadow: var(--shadow-card);
      position: relative;
      overflow: hidden;
      margin-bottom: 16px;
    }

    .hero-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--brand-gradient);
    }

    .hero-label {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-dim);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .hero-value {
      font-family: 'Outfit', sans-serif;
      font-size: 2.6rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 8px 0 6px 0;
      line-height: 1.1;
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    [data-theme="light"] .hero-value {
      color: #0f172a;
    }

    .currency-symbol {
      font-size: 1.6rem;
      font-weight: 600;
      color: var(--brand);
    }

    .hero-substats {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 10px;
      padding-top: 12px;
      border-top: 1px solid var(--border-subtle);
      flex-wrap: wrap;
    }

    .substat-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .substat-item strong {
      color: var(--text-main);
    }

    .substat-tag {
      font-size: 0.72rem;
      padding: 1px 6px;
      border-radius: 6px;
      font-weight: 600;
    }
    .substat-tag.positive {
      background: rgba(16, 185, 129, 0.15);
      color: var(--emerald);
    }
    .substat-tag.refund {
      background: rgba(244, 63, 94, 0.15);
      color: var(--rose);
    }

    /* 2-Column KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .kpi-card {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      box-shadow: var(--shadow-card);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.76rem;
      color: var(--text-dim);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .kpi-icon {
      font-size: 16px;
    }

    .kpi-value {
      font-family: 'Outfit', sans-serif;
      font-size: 1.55rem;
      font-weight: 700;
      color: var(--text-main);
      margin-top: 6px;
      line-height: 1.2;
    }

    .kpi-footer {
      font-size: 0.76rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* Live Operations Strip */
    .ops-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      margin-bottom: 20px;
    }

    .ops-title {
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-dim);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ops-badges {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .ops-badge-item {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 9px 8px;
      text-align: center;
    }

    .ops-badge-count {
      font-family: 'Outfit', sans-serif;
      font-size: 1.2rem;
      font-weight: 700;
      line-height: 1.1;
    }

    .ops-badge-count.pending { color: var(--amber); }
    .ops-badge-count.preparing { color: var(--cyan); }
    .ops-badge-count.delivery { color: var(--purple); }

    .ops-badge-label {
      font-size: 0.68rem;
      color: var(--text-dim);
      margin-top: 3px;
      font-weight: 500;
    }

    /* Bottom Navigation Tabs */
    .tab-bar {
      position: sticky;
      top: 10px;
      z-index: 20;
      display: flex;
      background: rgba(15, 22, 38, 0.9);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-subtle);
      border-radius: 999px;
      padding: 4px;
      margin-bottom: 18px;
      box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.4);
    }

    [data-theme="light"] .tab-bar {
      background: rgba(255, 255, 255, 0.92);
      box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.08);
    }

    .tab-btn {
      flex: 1;
      padding: 8px 6px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.82rem;
      font-weight: 600;
      border-radius: 999px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all 0.2s ease;
    }

    .tab-btn.active {
      background: var(--brand-gradient);
      color: #ffffff;
      box-shadow: 0 3px 12px var(--brand-glow);
    }

    .badge-count {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 999px;
    }

    /* Tab Content Sections */
    .tab-content {
      display: none;
      animation: fadeIn 0.2s ease;
    }
    .tab-content.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Section Cards */
    .section-card {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 18px;
      margin-bottom: 16px;
      box-shadow: var(--shadow-card);
    }

    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .section-title .tag {
      font-family: 'Inter', sans-serif;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--bg-surface);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
    }

    /* Hourly Chart */
    .chart-container {
      margin-top: 10px;
    }

    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 140px;
      padding: 10px 4px 4px 4px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .chart-col {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      position: relative;
    }

    .chart-bar {
      width: 100%;
      max-width: 16px;
      background: var(--brand-gradient);
      border-radius: 4px 4px 1px 1px;
      min-height: 4px;
      transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .chart-bar.current {
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
      box-shadow: 0 0 10px var(--emerald-glow);
    }

    .chart-x-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.68rem;
      color: var(--text-dim);
      margin-top: 6px;
      padding: 0 4px;
    }

    /* Progress Rows (Payment & Channel Breakdown) */
    .metric-row {
      margin-bottom: 12px;
    }
    .metric-row:last-child {
      margin-bottom: 0;
    }

    .metric-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.84rem;
      margin-bottom: 5px;
    }

    .metric-name {
      font-weight: 600;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .metric-amount {
      font-weight: 700;
      color: var(--text-main);
    }
    .metric-pct {
      font-size: 0.74rem;
      color: var(--text-dim);
      font-weight: 500;
      margin-left: 4px;
    }

    .progress-track {
      width: 100%;
      height: 7px;
      background: var(--bg-surface);
      border-radius: 999px;
      overflow: hidden;
      border: 1px solid var(--border-subtle);
    }

    .progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.5s ease;
    }

    /* Order / Delivery Cards */
    .order-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 14px;
      margin-bottom: 12px;
      transition: border-color 0.2s ease;
    }

    .order-card.delivery-card {
      border-left: 4px solid var(--purple);
    }

    .order-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .order-no {
      font-family: 'Outfit', sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .order-badge {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .badge-out-for-delivery {
      background: rgba(168, 85, 247, 0.2);
      color: var(--purple);
      border: 1px solid rgba(168, 85, 247, 0.4);
      animation: pulseDelivery 2s infinite ease;
    }

    @keyframes pulseDelivery {
      0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
      50% { box-shadow: 0 0 10px 2px rgba(168, 85, 247, 0.3); }
    }

    .badge-preparing {
      background: rgba(6, 182, 212, 0.15);
      color: var(--cyan);
      border: 1px solid rgba(6, 182, 212, 0.3);
    }

    .badge-pending {
      background: rgba(245, 158, 11, 0.15);
      color: var(--amber);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .customer-info {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .customer-name {
      font-weight: 600;
      color: var(--text-main);
    }

    .customer-address {
      font-size: 0.78rem;
      color: var(--text-dim);
      display: flex;
      align-items: flex-start;
      gap: 4px;
    }

    /* Quick Call & WhatsApp Action Buttons */
    .action-chips {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }

    .btn-action-chip {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .btn-call {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border-color: rgba(99, 102, 241, 0.3);
    }
    .btn-call:active {
      background: var(--brand);
      color: #ffffff;
    }

    .btn-whatsapp {
      background: rgba(16, 185, 129, 0.15);
      color: var(--emerald);
      border-color: rgba(16, 185, 129, 0.3);
    }
    .btn-whatsapp:active {
      background: var(--emerald);
      color: #ffffff;
    }

    .order-items-summary {
      font-size: 0.8rem;
      color: var(--text-dim);
      background: var(--bg-surface-elevated);
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      margin-top: 8px;
      line-height: 1.4;
    }

    .order-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--border-subtle);
      font-size: 0.78rem;
      color: var(--text-dim);
    }

    .order-footer strong {
      font-family: 'Outfit', sans-serif;
      font-size: 1.05rem;
      color: var(--text-main);
    }

    /* Top Dishes Ranking List */
    .item-rank-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 8px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .item-rank-row:last-child {
      border-bottom: none;
    }

    .item-rank-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .rank-number {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-dim);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .rank-number.top1 { background: rgba(245, 158, 11, 0.2); color: var(--amber); border-color: rgba(245, 158, 11, 0.4); }
    .rank-number.top2 { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; border-color: rgba(148, 163, 184, 0.4); }
    .rank-number.top3 { background: rgba(180, 83, 9, 0.2); color: #d97706; border-color: rgba(180, 83, 9, 0.4); }

    .item-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .item-sales-count {
      font-size: 0.74rem;
      color: var(--text-dim);
    }

    .item-amount {
      text-align: right;
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
    }

    /* Time Horizon Switcher */
    .time-horizon-bar {
      display: flex;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 4px;
      margin-bottom: 14px;
      gap: 4px;
    }

    .time-pill {
      flex: 1;
      padding: 7px 4px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: 9px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .time-pill.active {
      background: var(--brand-gradient);
      color: #ffffff;
      box-shadow: 0 2px 10px var(--brand-glow);
    }

    /* Operational Insights Grid */
    .ops-insights-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .ops-insight-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .ops-insight-label {
      font-size: 0.72rem;
      color: var(--text-dim);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .ops-insight-val {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 4px 0 2px 0;
      line-height: 1.2;
    }

    .ops-insight-desc {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    /* Staff Sales Leaderboard */
    .staff-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 8px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .staff-row:last-child {
      border-bottom: none;
    }

    .staff-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .staff-rank-badge {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--text-dim);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .staff-rank-badge.top1 { background: rgba(245, 158, 11, 0.2); color: var(--amber); border-color: rgba(245, 158, 11, 0.4); }
    .staff-rank-badge.top2 { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; border-color: rgba(148, 163, 184, 0.4); }
    .staff-rank-badge.top3 { background: rgba(180, 83, 9, 0.2); color: #d97706; border-color: rgba(180, 83, 9, 0.4); }

    .staff-info {
      display: flex;
      flex-direction: column;
    }

    .staff-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .staff-role-badge {
      font-size: 0.65rem;
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--bg-surface-elevated);
      color: var(--text-dim);
      text-transform: uppercase;
      font-weight: 600;
    }

    .staff-bills-count {
      font-size: 0.74rem;
      color: var(--text-dim);
    }

    .staff-sales-amount {
      font-family: 'Outfit', sans-serif;
      font-size: 0.98rem;
      font-weight: 700;
      color: var(--text-main);
      text-align: right;
    }

    /* Expandable Bill Card (Accordion Receipt) */
    .bill-accordion-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 14px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .bill-accordion-card:hover {
      border-color: var(--border-active);
    }

    .bill-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bill-chevron {
      font-size: 0.8rem;
      color: var(--text-dim);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      margin-left: 6px;
    }

    .bill-accordion-card.open .bill-chevron {
      transform: rotate(180deg);
      color: var(--brand);
    }

    .bill-details-drawer {
      display: none;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed var(--border-subtle);
      animation: fadeIn 0.2s ease;
    }

    .bill-accordion-card.open .bill-details-drawer {
      display: block;
    }

    .receipt-items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }

    .receipt-item-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      padding: 4px 0;
      color: var(--text-muted);
    }

    .receipt-item-left {
      display: flex;
      gap: 6px;
      color: var(--text-main);
    }

    .receipt-item-qty {
      font-weight: 700;
      color: var(--brand);
    }

    .receipt-item-price {
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      color: var(--text-main);
    }

    .receipt-summary-block {
      background: var(--bg-surface-elevated);
      border-radius: var(--radius-sm);
      padding: 8px 10px;
      font-size: 0.78rem;
    }

    .receipt-summary-line {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      color: var(--text-dim);
    }

    .receipt-summary-line.total {
      border-top: 1px solid var(--border-subtle);
      margin-top: 4px;
      padding-top: 6px;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-main);
    }

    /* Filter Chips Bar */
    .filter-chips-bar {
      display: flex;
      gap: 6px;
      margin-bottom: 14px;
      overflow-x: auto;
      padding-bottom: 4px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .filter-chips-bar::-webkit-scrollbar {
      display: none;
    }

    .filter-chip-btn {
      padding: 6px 13px;
      border-radius: 999px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      font-size: 0.76rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .filter-chip-btn.active {
      background: var(--brand-gradient);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 2px 8px var(--brand-glow);
    }

    /* PIN Lock Screen Modal */
    .lock-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(7, 10, 17, 0.94);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      z-index: 100;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .lock-overlay.active {
      display: flex;
    }

    .lock-box {
      width: 100%;
      max-width: 320px;
      text-align: center;
    }

    .lock-icon {
      width: 60px;
      height: 60px;
      border-radius: 18px;
      background: var(--brand-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin: 0 auto 18px auto;
      box-shadow: 0 8px 24px var(--brand-glow);
    }

    .lock-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .lock-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 24px;
    }

    .pin-display {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin-bottom: 28px;
    }

    .pin-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid var(--border-active);
      transition: all 0.2s ease;
    }

    .pin-dot.filled {
      background: var(--brand);
      box-shadow: 0 0 12px var(--brand-glow);
    }

    .pin-keypad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      width: 100%;
    }

    .pin-btn {
      aspect-ratio: 1;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .pin-btn:active {
      background: var(--brand);
      transform: scale(0.92);
      border-color: var(--brand);
    }

    .pin-btn.action-btn {
      font-size: 1rem;
      background: transparent;
      border: none;
      color: var(--text-dim);
    }

    .pin-error {
      color: var(--rose);
      font-size: 0.82rem;
      margin-top: 14px;
      font-weight: 600;
      min-height: 20px;
    }

    /* Empty / Awaiting Sync Screen */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      background: var(--bg-card);
      border: 1px dashed var(--border-subtle);
      border-radius: var(--radius-lg);
      margin-top: 20px;
    }

    .empty-icon {
      font-size: 44px;
      margin-bottom: 12px;
      opacity: 0.8;
    }

    .empty-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 6px;
      color: var(--text-main);
    }

    .empty-desc {
      font-size: 0.82rem;
      color: var(--text-muted);
      max-width: 320px;
      margin: 0 auto;
      line-height: 1.5;
    }

    /* Skeleton Loading pulse */
    .skeleton {
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
      background-size: 200% 100%;
      animation: skeletonShimmer 1.5s infinite;
      border-radius: 6px;
      display: inline-block;
    }

    @keyframes skeletonShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  </style>
</head>
<body>

  <!-- Ambient Glow -->
  <div class="bg-glow"></div>

  <!-- PIN Lock Screen -->
  <div id="lockOverlay" class="lock-overlay <?= $hasPin ? 'active' : '' ?>">
    <div class="lock-box">
      <div class="lock-icon">🔒</div>
      <h2 class="lock-title"><?= $storeName ?></h2>
      <p class="lock-subtitle">Enter your Dashboard PIN to unlock</p>

      <div class="pin-display">
        <div class="pin-dot" id="dot0"></div>
        <div class="pin-dot" id="dot1"></div>
        <div class="pin-dot" id="dot2"></div>
        <div class="pin-dot" id="dot3"></div>
      </div>

      <div class="pin-keypad">
        <button class="pin-btn" onclick="pressPin('1')">1</button>
        <button class="pin-btn" onclick="pressPin('2')">2</button>
        <button class="pin-btn" onclick="pressPin('3')">3</button>
        <button class="pin-btn" onclick="pressPin('4')">4</button>
        <button class="pin-btn" onclick="pressPin('5')">5</button>
        <button class="pin-btn" onclick="pressPin('6')">6</button>
        <button class="pin-btn" onclick="pressPin('7')">7</button>
        <button class="pin-btn" onclick="pressPin('8')">8</button>
        <button class="pin-btn" onclick="pressPin('9')">9</button>
        <button class="pin-btn action-btn" onclick="clearPin()">Clear</button>
        <button class="pin-btn" onclick="pressPin('0')">0</button>
        <button class="pin-btn action-btn" onclick="backspacePin()">⌫</button>
      </div>

      <div id="pinError" class="pin-error"></div>
    </div>
  </div>

  <!-- Main Application Container -->
  <main class="app-container">

    <!-- Header -->
    <header class="app-header">
      <div class="brand-wrap">
        <div class="brand-icon">⚡</div>
        <div class="brand-titles">
          <h1 id="uiStoreName"><?= $storeName ?></h1>
          <div class="brand-meta">
            <span id="liveStatusBadge" class="live-indicator">
              <span class="live-dot"></span>
              <span id="liveStatusText">LIVE</span>
            </span>
            <span id="lastSyncRelative" style="font-size: 0.72rem; color: var(--text-dim);">Connecting...</span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button id="btnRefresh" class="btn-icon" title="Refresh Live Data" onclick="fetchLiveData(true)">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>
        <button class="btn-icon" title="Toggle Theme" onclick="toggleTheme()">
          <span id="themeIcon">🌓</span>
        </button>
        <?php if ($hasPin): ?>
        <button class="btn-icon" title="Lock Dashboard" onclick="lockDashboard()">
          🔒
        </button>
        <?php endif; ?>
      </div>
    </header>

    <!-- Business Date Banner -->
    <div class="status-strip">
      <div>📅 Business Date: <strong id="uiDateText">Loading...</strong></div>
      <div id="uiClock">--:--</div>
    </div>

    <!-- Time Horizon Switcher -->
    <div class="time-horizon-bar">
      <button class="time-pill active" id="pillToday" onclick="setTimeHorizon('today')">Today</button>
      <button class="time-pill" id="pillYesterday" onclick="setTimeHorizon('yesterday')">Yesterday</button>
      <button class="time-pill" id="pillWeek" onclick="setTimeHorizon('week')">7 Days</button>
      <button class="time-pill" id="pillMonth" onclick="setTimeHorizon('month')">Month</button>
    </div>

    <!-- Hero Card: Net Sales -->
    <section class="hero-card">
      <div class="hero-label">
        <span id="uiHorizonLabel">Today's Net Sales</span>
        <span class="substat-tag positive" id="uiTodayGrowth">Active</span>
      </div>

      <div class="hero-value">
        <span class="currency-symbol" id="uiCurrencySymbol">₹</span>
        <span id="uiNetSales">0.00</span>
      </div>

      <div class="hero-substats">
        <div class="substat-item">
          <span>Gross:</span>
          <strong id="uiGrossSales">₹0.00</strong>
        </div>
        <div class="substat-item">
          <span>Refunds:</span>
          <span class="substat-tag refund" id="uiRefunds">-₹0.00</span>
        </div>
        <div class="substat-item">
          <span>Settled Bills:</span>
          <strong id="uiBillCount">0</strong>
        </div>
        <div class="substat-item">
          <span>Discounts:</span>
          <strong id="uiDiscounts">₹0.00</strong>
        </div>
        <div class="substat-item">
          <span>Taxes:</span>
          <strong id="uiTaxes">₹0.00</strong>
        </div>
      </div>
    </section>

    <!-- 4-Card KPI Grid -->
    <section class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <span>Avg Ticket</span>
          <span class="kpi-icon">🎯</span>
        </div>
        <div class="kpi-value" id="uiAvgTicket">₹0</div>
        <div class="kpi-footer">Per billed customer</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>Table Occupancy</span>
          <span class="kpi-icon">🪑</span>
        </div>
        <div class="kpi-value" id="uiTableOccupancy">0 / 0</div>
        <div class="kpi-footer" id="uiTableOccupancyPct">0% occupied right now</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>Items Sold</span>
          <span class="kpi-icon">📦</span>
        </div>
        <div class="kpi-value" id="uiItemsSold">0</div>
        <div class="kpi-footer">Portions prepared today</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>Peak Rush</span>
          <span class="kpi-icon">🔥</span>
        </div>
        <div class="kpi-value" id="uiPeakHour" style="font-size: 1.15rem; margin-top: 8px;">--:--</div>
        <div class="kpi-footer" id="uiPeakHourSub">Busiest hour today</div>
      </div>
    </section>

    <!-- Live Operations Counter -->
    <section class="ops-card">
      <div class="ops-title">
        <span>Live Kitchen & Deliveries</span>
        <span id="uiActiveTotal" style="color: var(--text-main); font-weight: 700;">0 In Progress</span>
      </div>
      <div class="ops-badges">
        <div class="ops-badge-item">
          <div class="ops-badge-count pending" id="uiPendingCount">0</div>
          <div class="ops-badge-label">⏳ Pending</div>
        </div>
        <div class="ops-badge-item">
          <div class="ops-badge-count preparing" id="uiPreparingCount">0</div>
          <div class="ops-badge-label">🍳 Cooking</div>
        </div>
        <div class="ops-badge-item">
          <div class="ops-badge-count delivery" id="uiDeliveryCount">0</div>
          <div class="ops-badge-label">🛵 On The Way</div>
        </div>
      </div>
    </section>

    <!-- Navigation Tab Bar -->
    <nav class="tab-bar">
      <button class="tab-btn active" onclick="switchTab('overview')">
        📊 Overview
      </button>
      <button class="tab-btn" onclick="switchTab('deliveries')">
        🛵 Deliveries <span class="badge-count" id="tabDeliveryBadge">0</span>
      </button>
      <button class="tab-btn" onclick="switchTab('bills')">
        🧾 Bills
      </button>
      <button class="tab-btn" onclick="switchTab('dishes')">
        🏆 Top Items
      </button>
    </nav>

    <!-- Tab 1: Overview -->
    <div id="tab-overview" class="tab-content active">

      <!-- Hourly Sales Chart -->
      <section class="section-card">
        <div class="section-title">
          <span>Today's Sales Trend</span>
          <span class="tag">Hourly</span>
        </div>
        <div class="chart-container">
          <div class="bar-chart" id="hourlyChartBars">
            <!-- Rendered by JS -->
          </div>
          <div class="chart-x-labels">
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>23:00</span>
          </div>
        </div>
      </section>

      <!-- Loss Prevention & Operational Insights -->
      <section class="section-card">
        <div class="section-title">
          <span>Operational Insights</span>
          <span class="tag">Loss Prevention & Control</span>
        </div>
        <div class="ops-insights-grid">
          <div class="ops-insight-card">
            <div class="ops-insight-label">🏷️ Discounts</div>
            <div class="ops-insight-val" id="uiOpsDiscounts">₹0.00</div>
            <div class="ops-insight-desc" id="uiOpsDiscountsCount">0 discounted bills</div>
          </div>
          <div class="ops-insight-card">
            <div class="ops-insight-label">⚠️ Voids / Cancelled</div>
            <div class="ops-insight-val" style="color: var(--rose);" id="uiOpsVoidsVal">₹0.00</div>
            <div class="ops-insight-desc" id="uiOpsVoidsCount">0 items cancelled</div>
          </div>
          <div class="ops-insight-card">
            <div class="ops-insight-label">🏛️ Tax Collected</div>
            <div class="ops-insight-val" id="uiOpsTaxes">₹0.00</div>
            <div class="ops-insight-desc">GST / VAT accrued</div>
          </div>
          <div class="ops-insight-card">
            <div class="ops-insight-label">🔥 Peak Rush Sales</div>
            <div class="ops-insight-val" id="uiOpsPeakSales">₹0.00</div>
            <div class="ops-insight-desc" id="uiOpsPeakBills">0 bills in rush hour</div>
          </div>
        </div>
      </section>

      <!-- Category Performance Breakdown -->
      <section class="section-card">
        <div class="section-title">
          <span>Category Performance</span>
          <span class="tag" id="uiCategoryCountTag">Top Categories</span>
        </div>
        <div id="categoryBreakdownList">
          <p style="font-size:0.82rem; color: var(--text-dim);">No category sales recorded yet</p>
        </div>
      </section>

      <!-- Staff Sales Leaderboard -->
      <section class="section-card">
        <div class="section-title">
          <span>Staff Sales Leaderboard</span>
          <span class="tag">Team Attribution</span>
        </div>
        <div id="staffLeaderboardList">
          <p style="font-size:0.82rem; color: var(--text-dim);">No staff sales recorded yet</p>
        </div>
      </section>

      <!-- Payment Methods Breakdown -->
      <section class="section-card">
        <div class="section-title">
          <span>Payment Methods</span>
          <span class="tag" id="uiPaymentTotal">₹0.00</span>
        </div>
        <div id="paymentMethodsList">
          <p style="font-size:0.82rem; color: var(--text-dim);">No transactions yet today</p>
        </div>
      </section>

      <!-- Order Channels Breakdown -->
      <section class="section-card">
        <div class="section-title">
          <span>Sales by Channel</span>
          <span class="tag">Dine-in / Takeaway / Delivery</span>
        </div>
        <div id="orderChannelsList">
          <!-- Rendered by JS -->
        </div>
      </section>

    </div>

    <!-- Tab 2: Live Deliveries & Active Orders -->
    <div id="tab-deliveries" class="tab-content">
      <section class="section-card">
        <div class="section-title">
          <span>Live Deliveries & Takeaway</span>
          <span class="tag" id="activeOrdersCountTag">0 Active</span>
        </div>

        <!-- Status Filter Chips -->
        <div class="filter-chips-bar">
          <button class="filter-chip-btn active" id="chipAll" onclick="setDeliveryFilter('all')">All (<span id="chipAllCount">0</span>)</button>
          <button class="filter-chip-btn" id="chipPending" onclick="setDeliveryFilter('pending')">⏳ Pending (<span id="chipPendingCount">0</span>)</button>
          <button class="filter-chip-btn" id="chipPreparing" onclick="setDeliveryFilter('preparing')">🍳 Cooking (<span id="chipPrepCount">0</span>)</button>
          <button class="filter-chip-btn" id="chipDelivery" onclick="setDeliveryFilter('out_for_delivery')">🛵 Delivering (<span id="chipDeliveryCount">0</span>)</button>
        </div>

        <div id="activeDeliveriesList">
          <div class="empty-state">
            <div class="empty-icon">🛵</div>
            <div class="empty-title">All Deliveries Dispatched</div>
            <p class="empty-desc">No active orders out for delivery or cooking right now.</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Tab 3: Recent Bills -->
    <div id="tab-bills" class="tab-content">
      <section class="section-card">
        <div class="section-title">
          <span>Recent Settled Bills</span>
          <span class="tag">Latest Transactions</span>
        </div>
        <div id="recentBillsList">
          <div class="empty-state">
            <div class="empty-icon">🧾</div>
            <div class="empty-title">No Bills Settled Yet</div>
            <p class="empty-desc">Bills generated in DinZin POS will stream here automatically.</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Tab 4: Top Dishes -->
    <div id="tab-dishes" class="tab-content">
      <section class="section-card">
        <div class="section-title">
          <span>Top Selling Dishes Today</span>
          <span class="tag">Quantity Sold</span>
        </div>
        <div id="topDishesList">
          <div class="empty-state">
            <div class="empty-icon">🍽️</div>
            <div class="empty-title">No Dishes Sold Yet</div>
            <p class="empty-desc">Item sales rankings will appear here as orders are placed.</p>
          </div>
        </div>
      </section>
    </div>

  </main>

  <script>
    // State
    let currentData = null;
    let refreshTimer = null;
    let enteredPin = '';
    let lastReceivedTimestamp = null;
    let currentHorizon = 'today';
    let currentDeliveryFilter = 'all';
    const PIN_REQUIRED = <?= $hasPin ? 'true' : 'false' ?>;

    // Currency Formatter
    function formatMoney(amount, symbol = '₹') {
      const num = Number(amount) || 0;
      return symbol + num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    // Time Horizon Controls
    function setTimeHorizon(horizon) {
      currentHorizon = horizon;
      ['today', 'yesterday', 'week', 'month'].forEach(h => {
        const pillId = 'pill' + h.charAt(0).toUpperCase() + h.slice(1);
        const pill = document.getElementById(pillId);
        if (pill) pill.classList.toggle('active', h === horizon);
      });
      if (currentData) {
        updateHorizonMetrics(currentData);
      }
    }

    function updateHorizonMetrics(data) {
      if (!data) return;
      const store = data.store || {};
      const currencySymbol = store.currency_symbol || '₹';
      const comp = data.comparison || {};

      let source = data.today || {};
      let title = "Today's Net Sales";
      let tagText = 'Active Day';
      let tagClass = 'positive';

      if (currentHorizon === 'yesterday') {
        source = comp.yesterday || {};
        title = "Yesterday's Net Sales";
        tagText = 'Previous Day';
        tagClass = '';
      } else if (currentHorizon === 'week') {
        source = comp.this_week || {};
        title = "Last 7 Days Sales";
        tagText = 'Past 7 Days';
        tagClass = '';
      } else if (currentHorizon === 'month') {
        source = comp.this_month || {};
        title = "This Month's Sales";
        tagText = 'Month-to-Date';
        tagClass = '';
      } else {
        // Today with comparison diff
        if (comp.growth_pct !== null && comp.growth_pct !== undefined) {
          const sign = comp.growth_pct >= 0 ? '+' : '';
          tagText = `${sign}${comp.growth_pct}% vs yesterday`;
          tagClass = comp.growth_pct >= 0 ? 'positive' : 'refund';
        }
      }

      document.getElementById('uiHorizonLabel').textContent = title;
      const growthTag = document.getElementById('uiTodayGrowth');
      growthTag.textContent = tagText;
      growthTag.className = 'substat-tag ' + tagClass;

      const netSales = Number(source.net_sales || 0);
      document.getElementById('uiNetSales').textContent = netSales.toLocaleString('en-IN', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      });
      document.getElementById('uiGrossSales').textContent = formatMoney(source.gross_sales, currencySymbol);
      document.getElementById('uiRefunds').textContent = '-' + formatMoney(source.refunds, currencySymbol);
      document.getElementById('uiBillCount').textContent = source.bill_count || 0;
      document.getElementById('uiDiscounts').textContent = formatMoney(source.discounts, currencySymbol);
      document.getElementById('uiTaxes').textContent = formatMoney(source.taxes, currencySymbol);
      document.getElementById('uiAvgTicket').textContent = formatMoney(source.avg_bill, currencySymbol);
    }

    // Delivery Status Filter Controls
    function setDeliveryFilter(filter) {
      currentDeliveryFilter = filter;
      ['all', 'pending', 'preparing', 'out_for_delivery'].forEach(f => {
        let btnId = 'chipAll';
        if (f === 'pending') btnId = 'chipPending';
        if (f === 'preparing') btnId = 'chipPreparing';
        if (f === 'out_for_delivery') btnId = 'chipDelivery';
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.toggle('active', f === filter);
      });
      if (currentData) {
        renderActiveDeliveries(currentData.active_orders || [], currentData.store?.currency_symbol || '₹');
      }
    }

    // Tab Switching
    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        const ids = ['overview', 'deliveries', 'bills', 'dishes'];
        btn.classList.toggle('active', ids[idx] === tabId);
      });
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const activeContent = document.getElementById('tab-' + tabId);
      if (activeContent) activeContent.classList.add('active');
    }

    // Theme Toggle
    function toggleTheme() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const newTheme = isLight ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      document.getElementById('themeIcon').textContent = newTheme === 'light' ? '☀️' : '🌓';
      localStorage.setItem('flo_theme', newTheme);
    }

    // Init Theme
    (function initTheme() {
      const saved = localStorage.getItem('flo_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', saved);
      document.getElementById('themeIcon').textContent = saved === 'light' ? '☀️' : '🌓';
    })();

    // Clock
    setInterval(() => {
      const now = new Date();
      document.getElementById('uiClock').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, 1000);

    // PIN Handlers
    function pressPin(digit) {
      if (enteredPin.length < 4) {
        enteredPin += digit;
        updatePinDots();
        if (enteredPin.length === 4) {
          submitPin();
        }
      }
    }

    function backspacePin() {
      if (enteredPin.length > 0) {
        enteredPin = enteredPin.slice(0, -1);
        updatePinDots();
        document.getElementById('pinError').textContent = '';
      }
    }

    function clearPin() {
      enteredPin = '';
      updatePinDots();
      document.getElementById('pinError').textContent = '';
    }

    function updatePinDots() {
      for (let i = 0; i < 4; i++) {
        const dot = document.getElementById('dot' + i);
        if (dot) dot.classList.toggle('filled', i < enteredPin.length);
      }
    }

    async function submitPin() {
      try {
        const res = await fetch('api.php?action=login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: enteredPin })
        });
        const json = await res.json();
        if (json.ok) {
          document.getElementById('lockOverlay').classList.remove('active');
          clearPin();
          fetchLiveData(true);
        } else {
          document.getElementById('pinError').textContent = json.error || 'Incorrect PIN';
          clearPin();
        }
      } catch (err) {
        document.getElementById('pinError').textContent = 'Network error checking PIN';
        clearPin();
      }
    }

    function lockDashboard() {
      enteredPin = '';
      updatePinDots();
      document.getElementById('lockOverlay').classList.add('active');
    }

    // Relative Time Formatter
    function getRelativeTime(isoString) {
      if (!isoString) return 'Never';
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 5) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      return `${diffHr}h ago`;
    }

    // Fetch Live Data
    async function fetchLiveData(manual = false) {
      const btn = document.getElementById('btnRefresh');
      if (manual && btn) btn.classList.add('spinning');

      try {
        const res = await fetch('api.php?action=data');
        if (res.status === 401) {
          if (PIN_REQUIRED) lockDashboard();
          return;
        }

        const data = await res.json();
        currentData = data;
        renderDashboard(data);
      } catch (err) {
        console.error('Failed to fetch live data:', err);
        setOfflineState();
      } finally {
        if (btn) btn.classList.remove('spinning');
      }
    }

    function setOfflineState() {
      const badge = document.getElementById('liveStatusBadge');
      badge.classList.add('offline');
      document.getElementById('liveStatusText').textContent = 'OFFLINE';
      document.getElementById('lastSyncRelative').textContent = 'Cannot reach server';
    }

    // Render Dashboard
    function renderDashboard(data) {
      const store = data.store || {};
      const today = data.today || {};
      const ops = data.operations || {};
      const currencySymbol = store.currency_symbol || '₹';

      // 1. Store Header & Live Status
      if (store.name) {
        document.getElementById('uiStoreName').textContent = store.name;
      }
      document.getElementById('uiCurrencySymbol').textContent = currencySymbol;

      const lastSync = data.server_received_at || data.synced_at;
      const isRecent = lastSync && (Date.now() - new Date(lastSync).getTime() < 180000); // 3 mins

      const badge = document.getElementById('liveStatusBadge');
      badge.classList.toggle('offline', !isRecent);
      document.getElementById('liveStatusText').textContent = isRecent ? 'LIVE' : 'STALE';
      document.getElementById('lastSyncRelative').textContent = isRecent ? ('Updated ' + getRelativeTime(lastSync)) : ('Last sync: ' + getRelativeTime(lastSync));

      // 2. Business Date
      const dateText = today.date ? new Date(today.date + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      }) : new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      document.getElementById('uiDateText').textContent = dateText;

      // 3. Hero Sales & Dynamic Time-Horizon
      updateHorizonMetrics(data);

      // 4. 4-Card KPI Grid
      const occCount = today.occupied_tables_count || 0;
      const totTables = today.total_tables_count || 0;
      document.getElementById('uiTableOccupancy').textContent = `${occCount} / ${totTables}`;
      const occPct = totTables > 0 ? Math.round((occCount / totTables) * 100) : 0;
      document.getElementById('uiTableOccupancyPct').textContent = `${occPct}% occupied right now`;

      document.getElementById('uiItemsSold').textContent = (today.items_sold_count || 0).toLocaleString();

      const peakHour = ops.peak_hour || {};
      document.getElementById('uiPeakHour').textContent = peakHour.label || '--:--';
      if (peakHour.sales > 0) {
        document.getElementById('uiPeakHourSub').textContent = `${formatMoney(peakHour.sales, currencySymbol)} • ${peakHour.bills} bills`;
      } else {
        document.getElementById('uiPeakHourSub').textContent = 'Busiest hour today';
      }

      // 5. Live Operations Bar
      const orders = data.active_orders || [];
      const pendingCount = orders.filter(o => o.status === 'pending').length;
      const prepCount = orders.filter(o => o.status === 'preparing').length;
      const deliveryCount = orders.filter(o => o.status === 'out_for_delivery').length;

      document.getElementById('uiPendingCount').textContent = pendingCount;
      document.getElementById('uiPreparingCount').textContent = prepCount;
      document.getElementById('uiDeliveryCount').textContent = deliveryCount;
      document.getElementById('uiActiveTotal').textContent = `${orders.length} In Progress`;
      document.getElementById('tabDeliveryBadge').textContent = deliveryCount;

      // 6. Operational Insights & Loss Prevention
      document.getElementById('uiOpsDiscounts').textContent = formatMoney(today.discounts, currencySymbol);
      document.getElementById('uiOpsDiscountsCount').textContent = `${ops.discount_bills_count || 0} discounted bills`;

      document.getElementById('uiOpsVoidsVal').textContent = formatMoney(ops.cancelled_items_total, currencySymbol);
      document.getElementById('uiOpsVoidsCount').textContent = `${ops.cancelled_items_count || 0} items voided`;

      document.getElementById('uiOpsTaxes').textContent = formatMoney(today.taxes, currencySymbol);

      document.getElementById('uiOpsPeakSales').textContent = formatMoney(peakHour.sales, currencySymbol);
      document.getElementById('uiOpsPeakBills').textContent = `${peakHour.bills || 0} bills (${peakHour.label || 'none'})`;

      // 7. Sub-sections Rendering
      renderHourlyChart(data.hourly_sales || []);
      renderCategoryBreakdown(data.categories || [], currencySymbol);
      renderStaffLeaderboard(data.staff_sales || [], currencySymbol);
      renderPaymentMethods(data.payment_methods || [], currencySymbol, Number(today.net_sales || 0));
      renderOrderChannels(data.order_types || [], currencySymbol);
      renderActiveDeliveries(orders, currencySymbol);
      renderRecentBills(data.recent_bills || [], currencySymbol);
      renderTopDishes(data.top_items || [], currencySymbol);
    }

    // Render Hourly Chart
    function renderHourlyChart(hourly) {
      const container = document.getElementById('hourlyChartBars');
      container.innerHTML = '';

      const maxSales = Math.max(...hourly.map(h => Number(h.total || 0)), 1);
      const currentHour = new Date().getHours();

      hourly.forEach(h => {
        const hour = Number(h.hour);
        const total = Number(h.total || 0);
        const heightPct = Math.max(Math.round((total / maxSales) * 100), 5);

        const col = document.createElement('div');
        col.className = 'chart-col';
        col.title = `${hour}:00 - ₹${total.toFixed(2)} (${h.count || 0} bills)`;

        const bar = document.createElement('div');
        bar.className = 'chart-bar' + (hour === currentHour ? ' current' : '');
        bar.style.height = `${heightPct}%`;

        col.appendChild(bar);
        container.appendChild(col);
      });
    }

    // Render Category Breakdown
    function renderCategoryBreakdown(categories, symbol) {
      const container = document.getElementById('categoryBreakdownList');
      if (!categories || categories.length === 0) {
        container.innerHTML = '<p style="font-size:0.82rem; color: var(--text-dim);">No category sales recorded yet</p>';
        return;
      }

      document.getElementById('uiCategoryCountTag').textContent = `${categories.length} Categories`;

      const colors = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#3b82f6'];

      container.innerHTML = categories.map((c, idx) => {
        const total = Number(c.total || 0);
        const pct = c.pct || 0;
        const color = colors[idx % colors.length];

        return `
          <div class="metric-row">
            <div class="metric-info">
              <span class="metric-name">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${color};"></span>
                ${c.name}
                <span style="font-size:0.75rem; color:var(--text-dim)">(${c.quantity || 0} sold)</span>
              </span>
              <div>
                <span class="metric-amount">${formatMoney(total, symbol)}</span>
                <span class="metric-pct">(${pct}%)</span>
              </div>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%; background: ${color};"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Staff Sales Leaderboard
    function renderStaffLeaderboard(staff, symbol) {
      const container = document.getElementById('staffLeaderboardList');
      if (!staff || staff.length === 0) {
        container.innerHTML = '<p style="font-size:0.82rem; color: var(--text-dim);">No staff sales recorded yet</p>';
        return;
      }

      container.innerHTML = staff.map((s, idx) => {
        const rank = idx + 1;
        const rankClass = rank === 1 ? 'top1' : (rank === 2 ? 'top2' : (rank === 3 ? 'top3' : ''));

        return `
          <div class="staff-row">
            <div class="staff-left">
              <div class="staff-rank-badge ${rankClass}">${rank}</div>
              <div class="staff-info">
                <div class="staff-name">
                  ${s.name}
                  <span class="staff-role-badge">${s.role || 'Staff'}</span>
                </div>
                <div class="staff-bills-count">${s.bills || 0} bills settled</div>
              </div>
            </div>
            <div class="staff-sales-amount">
              ${formatMoney(s.total, symbol)}
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Payment Methods
    function renderPaymentMethods(methods, symbol, netSales) {
      const container = document.getElementById('paymentMethodsList');
      if (!methods || methods.length === 0) {
        container.innerHTML = '<p style="font-size:0.82rem; color: var(--text-dim);">No transactions yet today</p>';
        return;
      }

      const totalMethods = methods.reduce((acc, m) => acc + Number(m.total || 0), 0) || 1;
      document.getElementById('uiPaymentTotal').textContent = formatMoney(totalMethods, symbol);

      const colors = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'];

      container.innerHTML = methods.map((m, idx) => {
        const total = Number(m.total || 0);
        const pct = Math.round((total / totalMethods) * 100);
        const color = colors[idx % colors.length];
        const rawName = (m.name || m.method || m.payment_method || 'Other').trim();
        let displayName = rawName;
        const lower = rawName.toLowerCase();
        if (lower === 'upi') displayName = 'UPI';
        else if (lower === 'cash') displayName = 'Cash';
        else if (lower === 'card') displayName = 'Card';
        else if (lower === 'wallet') displayName = 'Wallet';
        else if (lower === 'netbanking') displayName = 'Net Banking';
        else if (rawName.length > 0) displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

        return `
          <div class="metric-row">
            <div class="metric-info">
              <span class="metric-name">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${color};"></span>
                ${displayName}
              </span>
              <div>
                <span class="metric-amount">${formatMoney(total, symbol)}</span>
                <span class="metric-pct">(${pct}%)</span>
              </div>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%; background: ${color};"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Order Channels
    function renderOrderChannels(channels, symbol) {
      const container = document.getElementById('orderChannelsList');
      if (!channels || channels.length === 0) {
        container.innerHTML = '<p style="font-size:0.82rem; color: var(--text-dim);">No orders placed today</p>';
        return;
      }

      const channelIcons = {
        dine_in: '🍽️ Dine-in',
        takeaway: '🥡 Takeaway',
        delivery: '🛵 Delivery'
      };

      const totalRevenue = channels.reduce((acc, c) => acc + Number(c.total || 0), 0) || 1;

      container.innerHTML = channels.map(c => {
        const total = Number(c.total || 0);
        const pct = Math.round((total / totalRevenue) * 100);
        const label = channelIcons[c.type] || c.type;

        return `
          <div class="metric-row">
            <div class="metric-info">
              <span class="metric-name">${label} <span style="font-size:0.75rem; color:var(--text-dim)">(${c.count || 0} orders)</span></span>
              <div>
                <span class="metric-amount">${formatMoney(total, symbol)}</span>
                <span class="metric-pct">(${pct}%)</span>
              </div>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%; background: var(--brand-gradient);"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Active Deliveries & Orders (with filter support)
    function renderActiveDeliveries(orders, symbol) {
      const container = document.getElementById('activeDeliveriesList');
      const allCount = orders.length;
      const pendingCount = orders.filter(o => o.status === 'pending').length;
      const prepCount = orders.filter(o => o.status === 'preparing').length;
      const deliveryCount = orders.filter(o => o.status === 'out_for_delivery').length;

      const chipAll = document.getElementById('chipAllCount');
      if (chipAll) chipAll.textContent = allCount;
      const chipPending = document.getElementById('chipPendingCount');
      if (chipPending) chipPending.textContent = pendingCount;
      const chipPrep = document.getElementById('chipPrepCount');
      if (chipPrep) chipPrep.textContent = prepCount;
      const chipDel = document.getElementById('chipDeliveryCount');
      if (chipDel) chipDel.textContent = deliveryCount;

      document.getElementById('activeOrdersCountTag').textContent = `${allCount} Active`;

      let filtered = orders;
      if (currentDeliveryFilter !== 'all') {
        filtered = orders.filter(o => o.status === currentDeliveryFilter);
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🛵</div>
            <div class="empty-title">No Orders in this Status</div>
            <p class="empty-desc">No active orders matching this filter right now.</p>
          </div>
        `;
        return;
      }

      const statusLabels = {
        pending: { label: '⏳ Pending', class: 'badge-pending' },
        preparing: { label: '🍳 Cooking', class: 'badge-preparing' },
        out_for_delivery: { label: '🛵 OUT FOR DELIVERY', class: 'badge-out-for-delivery' }
      };

      container.innerHTML = filtered.map(o => {
        const st = statusLabels[o.status] || { label: o.status, class: 'badge-pending' };
        const cleanPhone = (o.customer_phone || '').replace(/[^0-9+]/g, '');
        const itemsText = Array.isArray(o.items)
          ? o.items.map(it => `${it.quantity}x ${it.name}`).join(', ')
          : (o.items_summary || 'Order items');

        const isDelivery = o.type === 'delivery' || o.status === 'out_for_delivery';

        return `
          <div class="order-card ${isDelivery ? 'delivery-card' : ''}">
            <div class="order-header">
              <div class="order-no">#${o.order_number || o.id}</div>
              <span class="order-badge ${st.class}">${st.label}</span>
            </div>

            <div class="customer-info">
              <div class="customer-name">${o.customer_name || 'Walk-in Customer'}</div>
              ${o.delivery_address ? `<div class="customer-address">📍 ${o.delivery_address}</div>` : ''}
              ${o.table_name ? `<div>🪑 Table: ${o.table_name}</div>` : ''}
            </div>

            <div class="order-items-summary">
              ${itemsText}
            </div>

            ${cleanPhone ? `
              <div class="action-chips">
                <a href="tel:${cleanPhone}" class="btn-action-chip btn-call">
                  📞 Call Customer
                </a>
                <a href="https://wa.me/${cleanPhone.replace('+', '')}" target="_blank" class="btn-action-chip btn-whatsapp">
                  💬 WhatsApp
                </a>
              </div>
            ` : ''}

            <div class="order-footer">
              <span>${getRelativeTime(o.created_at)}</span>
              <strong>${formatMoney(o.total, symbol)}</strong>
            </div>
          </div>
        `;
      }).join('');
    }

    // Toggle Accordion Bill Drawer
    function toggleBillAccordion(cardEl) {
      cardEl.classList.toggle('open');
    }

    // Render Recent Bills (with interactive itemized receipt inspection)
    function renderRecentBills(bills, symbol) {
      const container = document.getElementById('recentBillsList');
      if (!bills || bills.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🧾</div>
            <div class="empty-title">No Bills Settled Yet</div>
            <p class="empty-desc">Completed bills will stream here in real time.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = bills.map((b) => {
        const itemsList = Array.isArray(b.items) && b.items.length > 0 ? b.items : [];
        const cleanPhone = (b.customer_phone || '').replace(/[^0-9+]/g, '');
        const itemsText = b.items_summary
          ? b.items_summary
          : (itemsList.length > 0
              ? itemsList.map(it => `${it.quantity}x ${it.name}`).join(', ')
              : '');

        let paymentMethod = (b.payment_method || 'Cash').trim();
        const lowerPm = paymentMethod.toLowerCase();
        if (lowerPm === 'upi') paymentMethod = 'UPI';
        else if (lowerPm === 'cash') paymentMethod = 'Cash';
        else if (lowerPm === 'card') paymentMethod = 'Card';
        else if (lowerPm === 'wallet') paymentMethod = 'Wallet';
        else if (lowerPm === 'netbanking') paymentMethod = 'Net Banking';
        else if (paymentMethod.length > 0) paymentMethod = paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);

        const itemsHtml = itemsList.map(it => `
          <div class="receipt-item-row">
            <div class="receipt-item-left">
              <span class="receipt-item-qty">${it.quantity}x</span>
              <span class="receipt-item-name">${it.name}</span>
            </div>
            <span class="receipt-item-price">${formatMoney(it.total ?? (it.price * it.quantity), symbol)}</span>
          </div>
        `).join('');

        return `
          <div class="bill-accordion-card" onclick="toggleBillAccordion(this)">
            <div class="bill-header-row">
              <div class="order-no">Bill #${b.bill_number || b.id}</div>
              <div style="display:flex; align-items:center;">
                <span class="order-badge" style="background: rgba(16, 185, 129, 0.15); color: var(--emerald);">
                  ✓ Paid
                </span>
                <span class="bill-chevron">▼</span>
              </div>
            </div>

            <div class="customer-info" style="margin-top:6px;">
              <div>${b.customer_name || 'Counter Customer'}</div>
              <div style="font-size:0.75rem; color:var(--text-dim);">Method: <strong>${paymentMethod}</strong></div>
            </div>

            ${itemsText ? `
              <div class="order-items-summary" style="margin: 8px 0; color: var(--text-main);">
                🍽️ ${itemsText}
              </div>
            ` : ''}

            <div class="order-footer">
              <span>${getRelativeTime(b.paid_at || b.created_at)}</span>
              <strong>${formatMoney(b.paid_amount || b.total, symbol)}</strong>
            </div>

            <div class="bill-details-drawer" onclick="event.stopPropagation()">
              <div style="font-size:0.75rem; font-weight:700; color:var(--text-dim); text-transform:uppercase; margin-bottom:6px;">
                Itemized Receipt
              </div>
              <div class="receipt-items-table">
                ${itemsHtml || `<div style="font-size:0.78rem; color:var(--text-dim);">${itemsText || 'No item details recorded'}</div>`}
              </div>

              <div class="receipt-summary-block">
                ${b.subtotal !== undefined ? `
                  <div class="receipt-summary-line">
                    <span>Subtotal:</span>
                    <span>${formatMoney(b.subtotal, symbol)}</span>
                  </div>
                ` : ''}
                ${b.discount_amount ? `
                  <div class="receipt-summary-line" style="color:var(--rose);">
                    <span>Discount:</span>
                    <span>-${formatMoney(b.discount_amount, symbol)}</span>
                  </div>
                ` : ''}
                ${b.tax_amount ? `
                  <div class="receipt-summary-line">
                    <span>Taxes:</span>
                    <span>${formatMoney(b.tax_amount, symbol)}</span>
                  </div>
                ` : ''}
                <div class="receipt-summary-line total">
                  <span>Total Paid:</span>
                  <span style="color:var(--emerald);">${formatMoney(b.paid_amount || b.total, symbol)}</span>
                </div>
              </div>

              ${cleanPhone ? `
                <div class="action-chips" style="margin-top:10px;">
                  <a href="tel:${cleanPhone}" class="btn-action-chip btn-call">
                    📞 Call Customer
                  </a>
                  <a href="https://wa.me/${cleanPhone.replace('+', '')}" target="_blank" class="btn-action-chip btn-whatsapp">
                    💬 WhatsApp
                  </a>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Top Dishes
    function renderTopDishes(items, symbol) {
      const container = document.getElementById('topDishesList');
      if (!items || items.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🍽️</div>
            <div class="empty-title">No Dishes Sold Yet</div>
            <p class="empty-desc">Popular items will rank here as orders come in.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = items.map((it, idx) => {
        const rank = idx + 1;
        const rankClass = rank === 1 ? 'top1' : (rank === 2 ? 'top2' : (rank === 3 ? 'top3' : ''));

        return `
          <div class="item-rank-row">
            <div class="item-rank-left">
              <div class="rank-number ${rankClass}">${rank}</div>
              <div>
                <div class="item-name">${it.name}</div>
                <div class="item-sales-count">${it.quantity || 0} portions sold</div>
              </div>
            </div>
            <div class="item-amount">
              ${formatMoney(it.total, symbol)}
            </div>
          </div>
        `;
      }).join('');
    }

    // Initial Fetch & Recurring Background Poll (Every 15 Seconds)
    fetchLiveData();
    refreshTimer = setInterval(() => {
      fetchLiveData(false);
    }, 15000);
  </script>
</body>
</html>
