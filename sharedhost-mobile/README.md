# 📱 DinZin POS - Mobile Analytics Dashboard (Shared Hosting Package)

This standalone folder gives you a **real-time, mobile-first analytics and delivery tracking dashboard** that runs on any standard PHP shared hosting (cPanel, Hostinger, GoDaddy, Namecheap, Bluehost, Apache/Nginx).

Your local DinZin POS pushes real-time sales and order updates directly to this server over secure HTTPS. **No static IP, port forwarding, or router configuration is required at your restaurant!**

> 📖 **Full In-Depth Deployment Guide:** See [DEPLOYMENT.md](DEPLOYMENT.md) for full cPanel/FTP screenshots, permissions, security hardening, and troubleshooting.

---

## 🚀 3-Minute Setup Guide

### Step 1: Upload to your Shared Hosting
1. Log in to your **cPanel** (or FTP) and open **File Manager**.
2. Navigate to `public_html` (or create a subfolder like `public_html/dashboard` or `public_html/analytics`).
3. Upload and extract all files from this `sharedhost-mobile` folder into that directory:
   - `index.php` (Mobile analytics web app)
   - `sync.php` (Receiving endpoint for DinZin POS)
   - `api.php` (Dashboard API)
   - `config.php` (Configuration file)
   - `data/` (Folder where live data is saved)
     - `data/.htaccess` (Security: blocks direct web downloads of your live data)
     - `data/live_data.json`

### Step 2: Set Folder Permissions
Ensure the `data/` directory has write permissions so the script can save incoming sync updates:
- In cPanel File Manager, right-click `data/` ➔ **Change Permissions** ➔ Set to **`755`** (or `777` if required by your host).

### Step 3: Configure `config.php`
Open `config.php` in cPanel File Manager (or your code editor) and set:
```php
return [
    // Secret API Key: Pick any strong random key (e.g. 'my_secret_token_8899')
    'api_key' => 'YOUR_RANDOM_SECRET_KEY',

    // Optional 4-digit PIN for mobile phone access (e.g. '1234')
    // Leave empty '' if you don't want a PIN lock.
    'dashboard_pin' => '1234',

    // Store Name
    'store_name' => 'My Restaurant Name',
];
```

### Step 4: Configure DinZin POS
1. Open DinZin POS on your desktop.
2. Go to **Settings** ➔ **Mobile Access**.
3. Under **Live Mobile Sync (Shared Hosting)**:
   - Turn **Enable Live Mobile Sync** to **ON**.
   - **Sync URL**: Enter your full URL to `sync.php`, for example:
     `https://yourdomain.com/dashboard/sync.php`
   - **API Key**: Enter the exact same secret key you set in `config.php`.
   - Click **Test Connection**. You should see a green checkmark!
   - Click **Sync Now** to push current sales immediately.

### Step 5: Bookmark on Your Phone
1. Open your phone browser (Safari or Chrome) and visit:
   `https://yourdomain.com/dashboard/`
2. Tap **Share / Menu** ➔ **Add to Home Screen** to install it as an app icon!

---

## ✨ Features
- **Real-Time Net Sales & Gross Revenue**: Always know today's numbers wherever you are.
- **Settled Bills & Average Ticket Size**: Track average spend per customer.
- **Live Active Kitchen & Deliveries**:
  - Live count of orders: Pending, Cooking, and Out for Delivery.
  - One-tap **Call Customer** and **WhatsApp Customer** directly from your phone.
  - Delivery address and items preview.
- **Hourly Sales Trend Chart**: See your lunch and dinner rush peaks hour-by-hour.
- **Payment Methods Breakdown**: Cash, UPI, Card, NetBanking split with visual progress bars.
- **Top Selling Dishes**: Instant ranking of best-selling items today.
- **Zero Database Setup**: Uses fast, atomic JSON file caching (`LOCK_EX`). No MySQL database setup or maintenance needed!
