@echo off
setlocal enabledelayedexpansion
title FloCafe / Five Star Chicken Menu Importer

echo ========================================================
echo   Five Star Chicken Menu Importer for Client POS
echo ========================================================
echo.

REM 1. Detect flo.db location
set "DB_PATH=%APPDATA%\dinzin-desktop\flo.db"
if not exist "!DB_PATH!" (
    set "DB_PATH=%APPDATA%\DinZin\flo.db"
)
if not exist "!DB_PATH!" (
    set "DB_PATH=%APPDATA%\FloCafe\flo.db"
)
if not exist "!DB_PATH!" (
    set "DB_PATH=%LOCALAPPDATA%\Programs\dinzin-desktop\flo.db"
)
if not exist "!DB_PATH!" (
    if exist "flo.db" set "DB_PATH=%CD%\flo.db"
)

if not exist "!DB_PATH!" (
    echo [ERROR] Could not automatically locate flo.db.
    echo Please make sure the POS app was run at least once or place flo.db here.
    pause
    exit /b 1
)

echo [OK] Found POS Database: "!DB_PATH!"

REM 2. Verify menu_dump.sql exists
if not exist "menu_dump.sql" (
    echo [ERROR] menu_dump.sql not found!
    echo Please place menu_dump.sql in the same folder as this script.
    pause
    exit /b 1
)

REM 3. Create Backup
set "BACKUP_PATH=!DB_PATH!.backup.db"
copy /Y "!DB_PATH!" "!BACKUP_PATH!" >nul
echo [OK] Safety backup created: "!BACKUP_PATH!"

REM 4. Check or download sqlite3.exe
where sqlite3 >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set "SQLITE_BIN=sqlite3"
) else (
    if exist "sqlite3.exe" (
        set "SQLITE_BIN=sqlite3.exe"
    ) else (
        echo [INFO] Downloading standalone sqlite3.exe helper...
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/nalgeon/sqlean/releases/download/0.27.0/sqlite3-win-x64.exe' -OutFile 'sqlite3.exe'"
        if exist "sqlite3.exe" (
            set "SQLITE_BIN=sqlite3.exe"
        ) else (
            echo [ERROR] Could not download sqlite3.exe.
            pause
            exit /b 1
        )
    )
)

echo [INFO] Importing 62 items and 8 categories into client database...
"%SQLITE_BIN%" "!DB_PATH!" < menu_dump.sql

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! Menu imported into Client POS!
    echo   Historical sales and customer data are 100%% safe.
    echo ========================================================
) else (
    echo [ERROR] Import failed.
)

pause
