/**
 * Package Restaurant Website & Shared Host Bridge into a ready-to-upload deploy.zip for cPanel / Shared Hosting.
 * Usage: node scripts/package-sharedhost-deploy.cjs
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const websiteDir = path.join(rootDir, 'website');
const websiteOutDir = path.join(websiteDir, 'out');
const sharedhostDir = path.join(rootDir, 'sharedhost-mobile');
const stageDir = path.join(rootDir, 'dist-deploy');
const zipFile = path.join(rootDir, 'website-sharedhost-deploy.zip');

console.log('📦 Starting Shared Hosting Deployment Packager...');

// 1. Build website static export
console.log('🔨 Building website static export (BUILD_MODE=export)...');
execSync('npm run build:export', { cwd: websiteDir, stdio: 'inherit' });

// 2. Prepare clean staging directory
if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
fs.mkdirSync(stageDir, { recursive: true });

// Helper to recursively copy directories
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 3. Copy website/out into root of stageDir
console.log('📄 Copying website static assets...');
copyDir(websiteOutDir, stageDir);

// Guarantee all public assets (including images/hero) are synced
const publicDir = path.join(websiteDir, 'public');
if (fs.existsSync(publicDir)) {
  copyDir(publicDir, stageDir);
}

// 4. Ensure .htaccess is at root of stageDir
const htaccessSrc = path.join(websiteDir, 'public', '.htaccess');
if (fs.existsSync(htaccessSrc)) {
  fs.copyFileSync(htaccessSrc, path.join(stageDir, '.htaccess'));
}

// 5. Copy backend & queue bridge into both stageDir/dashboard and stageDir/sharedhost-mobile
console.log('🔗 Copying backend & queue bridge into /dashboard and /sharedhost-mobile...');
const targetSubdirs = ['dashboard', 'sharedhost-mobile'];
const phpFiles = ['api.php', 'config.php', 'index.php', 'sync.php', 'bill.php', 'receipt.php'];

// Also guarantee bill.php and receipt.php exist in the root of stageDir
for (const bFile of ['bill.php', 'receipt.php']) {
  const bSrc = path.join(sharedhostDir, bFile);
  if (fs.existsSync(bSrc)) {
    fs.copyFileSync(bSrc, path.join(stageDir, bFile));
  }
}
const initialFiles = {
  'pending_orders.json': '[]',
  'completed_orders.json': '[]',
  'menu_catalog.json': '{"categories":[],"items":[]}',
  'store_status.json': '{"is_open":true,"status_text":"Open Now"}',
  'live_data.json': '{}',
};

for (const sub of targetSubdirs) {
  const targetDir = path.join(stageDir, sub);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const file of phpFiles) {
    const srcFile = path.join(sharedhostDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(targetDir, file));
    }
  }

  // Ensure data folder with .htaccess and empty initial JSON files
  const stageDataDir = path.join(targetDir, 'data');
  fs.mkdirSync(stageDataDir, { recursive: true });

  const dataHtaccess = path.join(sharedhostDir, 'data', '.htaccess');
  if (fs.existsSync(dataHtaccess)) {
    fs.copyFileSync(dataHtaccess, path.join(stageDataDir, '.htaccess'));
  }

  for (const [filename, content] of Object.entries(initialFiles)) {
    const existingFile = path.join(sharedhostDir, 'data', filename);
    if (fs.existsSync(existingFile)) {
      fs.copyFileSync(existingFile, path.join(stageDataDir, filename));
    } else {
      fs.writeFileSync(path.join(stageDataDir, filename), content, 'utf8');
    }
  }
}

// 6. Create zip archive
console.log('🗜️ Creating deployment zip file...');
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

execSync(`zip -r "${zipFile}" .`, { cwd: stageDir, stdio: 'inherit' });

console.log(`\n✅ Deployment package created successfully!`);
console.log(`📦 Zip Archive: ${zipFile} (${(fs.statSync(zipFile).size / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`📁 Unpacked Staging Directory: ${stageDir}`);
