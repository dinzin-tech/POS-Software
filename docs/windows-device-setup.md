# DinZin Windows Host & Multi-Device Setup Guide

This guide explains how to install and host **DinZin POS** on a central **Windows PC** and connect other devices—such as Android/iPad tablets, mobile waiter terminals, Kitchen Display System (KDS) screens, customer displays, and ESC/POS thermal printers—over your local store network (Wi-Fi/LAN).

---

## Architecture Overview

```text
       +----------------------------------------------------+
       |          Main Host PC (Windows 10/11)               |
       |  - Runs DinZin Desktop App (.exe)                  |
       |  - Local SQLite Database                           |
       |  - API Server (:3001) | KDS (:3002) | Waiter (:3003)|
       +----------------------------------------------------+
                                 |
                        Store Local Wi-Fi / LAN
                                 |
       +-------------------------+-------------------------+
       |                         |                         |
+--------------+          +--------------+          +--------------+
| Waiter Tab   |          | Kitchen KDS  |          | Thermal      |
| (Android/iOS)|          | (Tablet/TV)  |          | Printer      |
| :3003 / :3001|          | :3002        |          | (USB / LAN)  |
+--------------+          +--------------+          +--------------+
```

---

## Step 1: Install & Set Up DinZin on the Main Windows PC

### 1.1 Install the Windows Desktop App
1. Download the Windows `.exe` installer (or build it locally using `npm run build:win` which outputs `release/dinzin-3.12.22-win-x64.exe`).
2. Double-click the installer once. It automatically installs **DinZin** and creates a shortcut on your **Desktop** and **Start Menu**.
3. Double-click the **DinZin icon** to open the app anytime. **No terminal or Node.js commands are required for daily operation.**

### 1.2 Configure Windows Firewall (Crucial for Multi-Device Access)
When DinZin starts for the first time, Windows Defender Firewall will prompt for network access:
1. Check **Private networks (such as home or work network)**.
2. Click **Allow Access**.

> **Manual Firewall Check (If tablets cannot connect):**
> 1. Open **Control Panel** -> **Windows Defender Firewall** -> **Allow an app through Windows Firewall**.
> 2. Ensure `dinzin-desktop` (or Node.js runtime) is checked for **Private** networks.
> 3. Ensure incoming traffic on ports **3001**, **3002**, and **3003** is allowed.

### 1.3 Find Your Windows Host IP Address
To connect other devices, you need the local IPv4 address of your main Windows PC:
1. Press `Win + R`, type `cmd`, and press **Enter**.
2. Type `ipconfig` and press **Enter**.
3. Look for **IPv4 Address** under your active Wi-Fi or Ethernet adapter (e.g., `192.168.1.100`).

---

## Step 2: Connect Other Devices (Tablets, Phones & KDS)

All secondary devices connect over the shop's local Wi-Fi without installing software!

### 2.1 Waiter & Table Order Terminals (Android / iPad / iPhone)
1. Connect the tablet to the **same Wi-Fi network** as the Windows Host PC.
2. Open Chrome or Safari on the tablet.
3. In the address bar, type:
   ```text
   http://192.168.1.100:3003
   ```
   *(Replace `192.168.1.100` with your Windows PC's IPv4 address)*
4. Log in using a Staff or Server PIN.
5. **Add to Home Screen (Make it look like a native app):**
   - **Android (Chrome):** Tap the 3 dots menu -> select **"Add to Home screen"**.
   - **iOS/iPad (Safari):** Tap the Share button -> select **"Add to Home Screen"**.

### 2.2 Kitchen Display System (KDS Screens)
1. Mount an Android tablet, iPad, or TV/PC browser in the kitchen area connected to local Wi-Fi.
2. Open the browser and go to:
   ```text
   http://192.168.1.100:3002
   ```
3. Log in with Chef or Manager credentials.
4. Orders sent from POS or waiter tablets appear instantly on the KDS screen in real-time.

### 2.3 Customer-Facing Display
1. Place a secondary tablet facing the customer at the checkout counter.
2. Open browser and go to:
   ```text
   http://192.168.1.100:3001/customer-display
   ```
3. The display will update live with items as the cashier builds the order cart.

---

## Step 3: Setting Up ESC/POS Thermal Printers

DinZin supports **58mm** and **80mm** thermal receipt printers over USB, LAN (Ethernet), or OS print queues.

### 3.1 USB Thermal Receipt Printer Setup
1. Connect the printer via USB cable to the main Windows PC and turn it on.
2. Open **DinZin** on the main PC and go to **Settings** -> **Printer Setup**.
3. Select **USB / Direct Printer** or **Windows Print Driver**.
4. Select your paper width (**80mm** or **58mm**).
5. Click **Test Print** to verify receipt output.

### 3.2 LAN / Network Thermal Receipt Printer Setup
1. Connect the thermal printer to your Wi-Fi router using an Ethernet cable.
2. Print a test page from the printer to get its static IP address (e.g., `192.168.1.200`).
3. In DinZin, go to **Settings** -> **Printer Setup** -> select **Network (TCP/IP)**.
4. Enter Printer IP: `192.168.1.200` and Port: `9100`.
5. Click **Test Print**.

---

## Step 4: Daily Operation Checklist

1. **Start of Day:**
   - Turn on the Windows Host PC.
   - Double-click the **DinZin** desktop icon to launch.
2. **Staff Devices:**
   - Turn on tablets/KDS screens. They automatically reconnect to the Windows host over Wi-Fi.
3. **End of Day:**
   - Perform Cash Drawer / Shift Close in DinZin.
   - Close the DinZin app from the system tray or File -> Exit.
