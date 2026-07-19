const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(__dirname, 'www');

const filesToCopy = [
    'index.html',
    'app.js',
    'styles.css',
    'manifest.json',
    'sw.js',
    'icon-192.png',
    'icon-512.png'
];

console.log('Starting build process...');

// Clean destination directory
if (fs.existsSync(destDir)) {
    console.log('Cleaning www/ directory...');
    fs.rmSync(destDir, { recursive: true, force: true });
}

// Create destination directory
fs.mkdirSync(destDir, { recursive: true });

// Copy files
filesToCopy.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    
    if (fs.existsSync(srcPath)) {
        console.log(`Copying ${file} to www/...`);
        fs.copyFileSync(srcPath, destPath);
    } else {
        console.warn(`Warning: Source file ${file} not found.`);
    }
});

console.log('Build completed successfully!');
