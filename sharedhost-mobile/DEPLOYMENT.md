# 📱 DinZin POS - Shared Hosting Mobile Dashboard Deployment Guide

Complete step-by-step guide to deploying the **Real-Time Mobile Analytics & Remote Order Dashboard** to any standard shared web hosting (cPanel, Hostinger, GoDaddy, Namecheap, Bluehost, Apache, or Nginx).

---

## 📑 Table of Contents
1. [Overview & How It Works](#1-overview--how-it-works)
2. [What Files & Folders to Deploy](#2-what-files--folders-to-deploy)
3. [Step-by-Step Deployment Methods](#3-step-by-step-deployment-methods)
   - [Method A: cPanel File Manager (Recommended)](#method-a-cpanel-file-manager-recommended)
   - [Method B: FTP / SFTP](#method-b-ftp--sftp)
4. [Setting Folder Permissions](#4-setting-folder-permissions)
5. [Configuring `config.php`](#5-configuring-configphp)
6. [Configuring DinZin Desktop POS](#6-configuring-dinzin-desktop-pos)
7. [Setting Up Mobile Phone Access (Add to Home Screen)](#7-setting-up-mobile-phone-access-add-to-home-screen)
8. [Mobile Dashboard Features](#8-mobile-dashboard-features)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. Overview & How It Works

The **Shared Hosting Mobile Package** allows restaurant owners and managers to monitor live sales, orders, deliveries, and kitchen status from anywhere on their smartphones.

* **Zero Hardware / Router Configuration**: You do **NOT** need a static IP, router port forwarding, or firewall exceptions at your restaurant.
* **Outgoing Push Architecture**: Your local DinZin desktop POS sends encrypted HTTPS updates to your shared hosting server whenever a bill is paid, an order status changes, or at configurable time intervals (e.g., every 30 seconds).
* **Zero Database Maintenance**: Built with fast atomic JSON file caching (`LOCK_EX`). No MySQL database setup, table creation, or SQL migrations are required.
* **Broad Compatibility**: Works on any server running PHP 7.4, 8.0, 8.1, 8.2, or 8.3.

```
┌─────────────────────────┐                     ┌─────────────────────────────┐
│  Local DinZin POS App   │  HTTPS POST (Push)  │  Shared Hosting Server      │
│  (Desktop at Restaurant)├────────────────────►│  (cPanel / Apache / PHP)    │
└─────────────────────────┘                     └──────────────┬──────────────┘
                                                               │
                                                               ▼
                                                ┌─────────────────────────────┐
                                                │  Mobile Phone Browser       │
                                                │  (Owner / Manager / Driver) │
                                                └─────────────────────────────┘
```

---

## 2. What Files & Folders to Deploy

> [!IMPORTANT]
> **DO NOT** upload your entire POS desktop project (do **NOT** upload `node_modules`, `frontend/`, `main/`, `dist/`, or `.git`).
> **ONLY** upload the files inside the `sharedhost-mobile/` folder.

Here is the exact structure to deploy:

```text
sharedhost-mobile/
├── index.php             <- Mobile web application UI (HTML, CSS, JS)
├── sync.php              <- Secure receiver webhook endpoint for DinZin POS
├── api.php               <- REST API serving live data to index.php
├── config.php            <- Configuration file (API key, store name, optional PIN)
└── data/                 <- Storage folder for live snapshot cache
    ├── .htaccess         <- Security: prevents public web downloads of live data
    └── live_data.json    <- Sales and order snapshot (auto-generated)
```

### File Breakdown:
| File / Directory | Purpose | Needs Editing? |
| :--- | :--- | :--- |
| `index.php` | The mobile web application interface. Displays sales metrics, hourly charts, kitchen orders, and delivery contacts. | No |
| `sync.php` | The receiving endpoint. Authenticates POS requests via `X-API-Key` and saves incoming updates atomically. | No |
| `api.php` | Serves data to `index.php` and handles optional 4-digit PIN authentication. | No |
| `config.php` | Stores your secret API key, optional dashboard PIN, and restaurant name. | **Yes** (set your API key) |
| `data/` | Directory where incoming sync JSON data is stored. | **Yes** (set write permissions) |
| `data/.htaccess` | Blocks external browsers from downloading `live_data.json` directly. | No |

---

## 3. Step-by-Step Deployment Methods

You can host this under a **subfolder** (e.g. `yourdomain.com/dashboard/`) or under a **subdomain** (e.g. `pos.yourdomain.com/` or `live.yourdomain.com/`).

---

### Method A: cPanel File Manager (Recommended)

1. **Compress the Folder**:
   - On your computer, open the `sharedhost-mobile` directory.
   - Select `index.php`, `sync.php`, `api.php`, `config.php`, and the `data` folder.
   - Right-click and compress them into a `.zip` file (e.g., `mobile-dashboard.zip`).

2. **Log in to cPanel**:
   - Log in to your hosting account (Hostinger, GoDaddy, Namecheap, cPanel, etc.).
   - Open **File Manager**.

3. **Navigate to Target Directory**:
   - Go to `public_html`.
   - Create a new folder where you want the dashboard to live:
     * Example: `public_html/dashboard`
     * (If using a subdomain like `pos.yourdomain.com`, open that subdomain's document root folder).

4. **Upload and Extract**:
   - Click **Upload** in the top toolbar and upload `mobile-dashboard.zip`.
   - Once uploaded, right-click the zip file in File Manager and select **Extract**.
   - Verify that `index.php`, `sync.php`, `api.php`, `config.php`, and `data/` are now present in the folder.
   - You can delete the `.zip` file after extraction.

---

### Method B: FTP / SFTP

1. Open your FTP client (such as **FileZilla**, **WinSCP**, or **Cyberduck**).
2. Connect to your hosting server using your FTP Host, Username, and Password.
3. In the remote server pane, navigate to:
   `public_html/dashboard/` (or your chosen directory).
4. In your local computer pane, open `sharedhost-mobile/`.
5. Upload all files (`index.php`, `sync.php`, `api.php`, `config.php`) and the `data/` folder.

---

## 4. Setting Folder Permissions

The script needs permission to write incoming POS data to `data/live_data.json`.

1. In cPanel **File Manager** (or your FTP client), locate the **`data`** folder.
2. Right-click on **`data`** and select **Change Permissions** (or **File Permissions**).
3. Set the permission value to:
   * **`755`** (`rwxr-xr-x`) — Standard for most Linux shared hosts (Apache/suPHP/FastCGI).
   * If your host uses a restrictive process owner and reports a write error, set it to **`775`** or **`777`**.
4. Click **Change Permissions** / **Save**.

### 🔒 Verify Security:
Test security by visiting:
`https://yourdomain.com/dashboard/data/live_data.json`
Your browser should show **403 Forbidden** or **Access Denied**. This confirms the `.htaccess` rule is successfully protecting your raw data.

---

## 5. Configuring `config.php`

Open `config.php` in the cPanel File Manager Code Editor (or in your editor before uploading):

```php
<?php
return [
    // 1. Secret API Key
    // Pick any strong, unique key.
    // MUST match the API Key entered in DinZin Desktop POS.
    'api_key' => 'YOUR_RANDOM_SECRET_KEY_8899',

    // 2. Optional Dashboard PIN for Phone Security
    // Set a 4-digit PIN (e.g. '1234') to require a PIN on phones.
    // Leave empty '' if you prefer one-tap access without a PIN.
    'dashboard_pin' => '1234',

    // 3. Store Name
    'store_name' => 'My Restaurant & Cafe',

    // 4. Data storage path (default is data/live_data.json)
    'data_file' => __DIR__ . '/data/live_data.json',

    // 5. Login session duration on phone (in seconds, default: 30 days)
    'session_lifetime' => 2592000,
];
```

* Save and close `config.php`.

---

## 6. Configuring DinZin Desktop POS

Now link your desktop POS to your newly uploaded server:

1. Launch **DinZin POS** on your desktop.
2. Navigate to **Settings** ➔ **Mobile Access**.
3. Scroll to the **Live Mobile Sync (Shared Hosting)** card.
4. Configure the settings:
   * **Enable Live Mobile Sync**: Toggle to **ON**.
   * **Sync URL**: Enter the full URL to your `sync.php` endpoint.
     * Example: `https://yourdomain.com/dashboard/sync.php`
     * (If hosted on a subdomain: `https://pos.yourdomain.com/sync.php`)
   * **API Key**: Enter the exact same secret key you configured in `config.php` (e.g., `YOUR_RANDOM_SECRET_KEY_8899`).
   * **Sync Interval**: Set your preferred interval in seconds (default: `30` seconds).
5. Click **Test Connection**:
   * You should see a green notification: **`Connection successful! DinZin live sync endpoint is online and authorized.`**
6. Click **Sync Now** to push current sales immediately.

```
┌─────────────────────────────────────────────────────────────┐
│ 📱 Live Mobile Sync (Shared Hosting)                        │
├─────────────────────────────────────────────────────────────┤
│ Enable Live Mobile Sync:  [ ON ]                            │
│                                                             │
│ Sync URL:  [ https://yourdomain.com/dashboard/sync.php    ] │
│ API Key:   [ •••••••••••••••••••••••••••••••••            ] │
│ Interval:  [ 30 ] seconds                                   │
│                                                             │
│ [ Test Connection ]   [ Sync Now ]                          │
│                                                             │
│ Status: Connected | Last synced: Just now                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Setting Up Mobile Phone Access (Add to Home Screen)

You and your staff can view the dashboard directly from any iPhone, iPad, or Android smartphone.

### On Apple iPhone / iPad (Safari):
1. Open **Safari** and visit your dashboard URL:
   `https://yourdomain.com/dashboard/`
2. If you configured a PIN, enter it (e.g. `1234`) and tap **Unlock**.
3. Tap the **Share** button (the square with an arrow pointing up at the bottom).
4. Scroll down and tap **Add to Home Screen**.
5. Give it a name like `DinZin Live` and tap **Add**.
6. An app icon is added to your iPhone home screen. Tapping it opens the dashboard in fullscreen mode without browser navigation bars.

### On Android (Google Chrome):
1. Open **Chrome** and navigate to your dashboard URL:
   `https://yourdomain.com/dashboard/`
2. Enter your PIN if prompted.
3. Tap the **Three Dots (Menu)** in the top-right corner.
4. Tap **Add to Home screen** (or **Install app**).
5. Confirm by tapping **Add**.

---

## 8. Mobile Dashboard Features

Once running, the mobile dashboard automatically updates and provides actionable restaurant business intelligence:

* **Interactive Time-Horizon Switcher**:
  * Tap **Today**, **Yesterday**, **7 Days**, or **Month** at the top of the screen.
  * Dynamically switches Net Sales, Gross Revenue, Settled Bills, Avg Ticket, Discounts, and Taxes.
  * Shows day-over-day growth percentage (e.g. `+14.5% vs yesterday`).
* **Operational Insights & Loss Prevention**:
  * **🔥 Peak Rush Hour**: Busiest sales window with total rush revenue and bills served (e.g. `19:00 - 20:00`).
  * **🏷️ Total Discounts Given**: Tracks discount value and number of bills with discounts applied.
  * **⚠️ Voids & Cancelled Items**: Loss prevention tracker showing voided item count and lost value.
  * **🏛️ Tax Collected**: GST / VAT accrued in real time.
* **Category Performance Breakdown**:
  * Top selling menu categories (e.g., Beverages, Mains, Snacks, Desserts).
  * Color-coded progress bars showing percentage contribution and portions sold.
* **Staff Sales Leaderboard**:
  * Ranked leaderboard of staff/cashier performance.
  * Attribution of bills handled and total sales volume per employee.
* **Expandable Itemized Receipts (Bills Tab)**:
  * Tap any settled bill to expand its full receipt.
  * Shows ordered dishes, portion quantities, item totals, subtotal, discounts, and taxes.
  * Direct Call and WhatsApp buttons if the customer's phone number is on file.
* **Live Orders & Deliveries with Filter Chips**:
  * Status filter chips: `All`, `⏳ Pending`, `🍳 Cooking`, and `🛵 Delivering`.
  * Direct tap-to-call and WhatsApp customer contact buttons.
* **Payment Methods & Sales by Channel**:
  * Percentage breakdown for Cash, Card, UPI, and online wallets.
  * Revenue breakdown across Dine-in, Takeaway, and Delivery orders.
* **Offline / Out-of-Sync Indicator**:
  * Displays live pulse dot and the exact relative sync time (e.g. `Updated 12s ago`).

---

## 9. Troubleshooting & FAQs

### Q: Test Connection fails with "Unauthorized: Invalid API Key" (HTTP 401)
* **Cause**: The API key in DinZin POS does not match the key in `config.php`.
* **Fix**: Open `config.php` on your server and verify the `'api_key'` string. Copy and paste it directly into DinZin POS under **Settings ➔ Mobile Access**.

### Q: Test Connection fails with "Server error: HTTP 404"
* **Cause**: The Sync URL is pointing to a non-existent path.
* **Fix**: Ensure the URL ends with `/sync.php`. If you extracted files inside a subfolder, make sure the folder path matches (e.g. `https://domain.com/dashboard/sync.php`, not `https://domain.com/sync.php`).

### Q: Test Connection fails with "Connection timed out" or "Could not reach server"
* **Cause**: SSL certificate issue or domain is inaccessible.
* **Fix**:
  1. Make sure your hosting domain has an active SSL certificate (`https://`).
  2. Open `https://yourdomain.com/dashboard/sync.php` in your desktop web browser. If it is working, it will respond with:
     ```json
     {"ok":false,"error":"Unauthorized: Invalid or missing API Key"}
     ```
     This confirms the file is reachable.

### Q: Sync succeeds, but dashboard says "Waiting for first sync"
* **Cause**: The `data/` directory is not writable by PHP.
* **Fix**: Set permissions for `data/` to `755` (or `777` if required by your hosting environment). Then in DinZin POS, click **Sync Now**.

### Q: Can I view the dashboard on multiple phones at the same time?
* **Yes!** Owners, managers, chefs, and delivery drivers can open the URL simultaneously on any number of mobile devices.

### Q: Does my restaurant computer need to stay on?
* The local desktop POS sends updates while it is running. When the restaurant computer is turned off at night, the mobile dashboard preserves the last recorded numbers and displays the final closing snapshot.
