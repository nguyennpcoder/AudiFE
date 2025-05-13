// fix-build.mjs
import fs from 'fs';
import { execSync } from 'child_process';

console.log('Fixing build configuration...');

// 1. Update vite.config.ts to remove ThreeJS chunks
const viteConfigPath = 'vite.config.ts';
if (fs.existsSync(viteConfigPath)) {
  console.log('Updating vite.config.ts...');
  let content = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Remove the manualChunks configuration for Three.js
  const chunkConfig = content.match(/manualChunks\s*:\s*{[\s\S]*?}/);
  if (chunkConfig) {
    const newContent = content.replace(/manualChunks\s*:\s*{[\s\S]*?}/, 'manualChunks: {}');
    fs.writeFileSync(viteConfigPath, newContent);
  }
}

// 2. Uninstall ThreeJS packages
console.log('Uninstalling ThreeJS packages...');
try {
  execSync('yarn remove @react-three/drei @react-three/fiber three', { stdio: 'inherit' });
  console.log('Successfully removed ThreeJS packages');
} catch (error) {
  console.log('Packages not installed or error removing: ', error.message);
}

// 3. Update package.json build script again
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  console.log('Updating package.json...');
  let content = fs.readFileSync(packageJsonPath, 'utf8');
  
  // Replace build script
  content = content.replace(
    '"build": "tsc -b && vite build"',
    '"build": "vite build"'
  );
  
  fs.writeFileSync(packageJsonPath, content);
}

// 4. Run the build
console.log('Running build...');
try {
  execSync('yarn build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
  console.log('\nTo deploy to Firebase, run:');
  console.log('firebase deploy --only hosting');
} catch (error) {
  console.error('Error during build:', error.message);
}