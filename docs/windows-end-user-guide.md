# Complete DinZin Windows Setup Guide (No Commands Required)

This guide is designed for store owners, managers, and staff. It contains **zero command-line steps**. Everything is done using normal Windows clicks, buttons, and web browsers.

---

## Overview

* **Main Host Computer (Windows 10/11):** Runs the DinZin desktop app and holds your store database.
* **Secondary Devices (Android Tabs, iPads, Kitchen Displays):** Connect to the Main Host over your store Wi-Fi using a web browser. No app installation needed on tablets!

---

## Step 1: Install DinZin on Your Windows PC

1. **Download the Installer:**
   - Download the file named `dinzin-3.12.22-win-x64.exe`.
2. **Install the Application:**
   - Double-click `dinzin-3.12.22-win-x64.exe` to run the setup wizard.
   - Follow the on-screen instructions. 
   - A **DinZin** shortcut icon will automatically appear on your **Desktop** and **Start Menu**.

---

## Step 2: First-Time Launch & Firewall Permission

1. **Launch DinZin:**
   - Double-click the **DinZin** icon on your Desktop.
2. **Allow Windows Firewall (Important for connecting tablets):**
   - A popup window titled **"Windows Defender Firewall has blocked some features of this app"** will appear.
   - Check the box for **"Private networks (such as home or work network)"**.
   - Click **Allow access**.
3. **Complete the Setup Wizard:**
   - Follow the 6-step on-screen setup inside DinZin:
     1. Choose store name (e.g. *Tasty Bites Cafe*).
     2. Select your country and currency.
     3. Create your 4-digit Master PIN and Owner login.

---

## Step 3: Find Your Windows IP Address (Without Command Prompt)

To connect tablets, you need the local Wi-Fi address of your main Windows PC:

1. Click the **Start Menu** and open **Settings** (or press `Win + I`).
2. Click **Network & internet** on the left menu.
3. Click **Wi-Fi** (or **Ethernet** if connected via cable).
4. Click on your connected network name.
5. Scroll down to the **Properties** section and look for **IPv4 address** (e.g., `192.168.1.100`).

> **Note:** Write this IP address down (e.g., `192.168.1.100`). You will use it to connect tablets in Step 4.

---

## Step 4: Connect Tablets, Phones & Kitchen Displays

No software needs to be installed on tablets or mobile devices. They connect over your shop Wi-Fi through a browser!

### 4.1 Mobile Waiter & Table Order Terminals (Android Tabs / iPads)
1. Connect the tablet to the **same Wi-Fi network** as the Windows PC.
2. Open **Chrome** (Android) or **Safari** (iPad).
3. Type this web address into the browser bar and tap Enter:
   ```text
   http://192.168.1.100:3003
   ```
   *(Replace `192.168.1.100` with your Windows PC's IPv4 address from Step 3)*
4. Log in with your Waiter or Cashier PIN.
5. **Create an App Icon on the Tablet:**
   - **Android (Chrome):** Tap the 3 dots menu in top-right -> tap **"Add to Home screen"**.
   - **iPad / iPhone (Safari):** Tap the Share icon -> tap **"Add to Home Screen"**.

### 4.2 Kitchen Display System (KDS Screen in Kitchen)
1. Mount a tablet, Android TV, or browser screen in the kitchen connected to Wi-Fi.
2. Open Chrome/Safari and type:
   ```text
   http://192.168.1.100:3002
   ```
3. Log in with Chef or Manager credentials. Orders sent from POS or waiter tablets will pop up live on the kitchen screen!

### 4.3 Customer Checkout Display
1. Place a tablet facing the customer at the checkout counter.
2. Open browser and type:
   ```text
   http://192.168.1.100:3001/customer-display
   ```

---

## Step 5: Setting Up Thermal Receipt Printers

### 5.1 USB Thermal Receipt Printer
1. Plug the printer's USB cable into your Windows PC and turn on power.
2. Open **DinZin** on your main PC.
3. Click **Settings** (gear icon) -> select **Printers**.
4. Choose your printer from the dropdown menu and select paper size (**80mm** or **58mm**).
5. Click **Test Print**.

### 5.2 LAN / Ethernet Thermal Receipt Printer
1. Plug an Ethernet network cable from your printer into your Wi-Fi router.
2. Inside DinZin, go to **Settings** -> **Printers** -> select **Network (TCP/IP)**.
3. Type the printer's IP address (e.g. `192.168.1.200`) and Port `9100`.
4. Click **Test Print**.

---

## Daily Store Routine (1-Click Startup)

1. **Morning:** Turn on your Windows PC and double-click the **DinZin** desktop icon.
2. **Staff:** Tablets and kitchen screens automatically connect over Wi-Fi when opened.
3. **Evening:** Perform Shift/Cash Close inside DinZin, then close the app.
