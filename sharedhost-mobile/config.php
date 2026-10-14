<?php
/**
 * DinZin POS - Mobile Analytics Dashboard Configuration
 * Upload this entire folder to your shared hosting (e.g. public_html/dashboard or public_html/analytics)
 */

return [
    /**
     * API Key: Secret token required for DinZin POS to push updates.
     * MUST MATCH the API Key entered in DinZin POS Settings -> Mobile Access.
     * Keep this secret! Change it to your own random alphanumeric string.
     */
    'api_key' => 'dinzin_live_sync_secret_key_change_me',

    /**
     * Mobile Dashboard PIN:
     * Optional 4-6 digit numeric or alphanumeric PIN to protect the dashboard.
     * - Set e.g. '1234' to require a PIN when viewing on mobile browsers.
     * - Set to '' (empty string) to allow viewing without any PIN prompt.
     */
    'dashboard_pin' => '',

    /**
     * Default Restaurant / Store Name (used if not yet pushed from POS).
     */
    'store_name' => 'FloCafe Restaurant',

    /**
     * Path where live snapshot JSON is stored.
     * Ensure the 'data' directory has write permissions (chmod 755 or 777).
     */
    'data_file' => __DIR__ . '/data/live_data.json',

    /**
     * Session lifetime in seconds for PIN login (default: 30 days).
     */
    'session_lifetime' => 2592000,
];
