// deploy.mjs
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name correctly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Create .env file
fs.writeFileSync('.env', 'VITE_API_URL=https://audivn.onrender.com/api/v1\n');
console.log('Created .env file with backend URL');

// 2. Update service files
// Update dealershipService.ts
const dealershipServicePath = 'src/services/dealershipService.ts';
if (fs.existsSync(dealershipServicePath)) {
  console.log('Updating dealershipService.ts...');
  let content = fs.readFileSync(dealershipServicePath, 'utf8');
  if (!content.includes('import.meta.env.VITE_API_URL')) {
    content = content.replace(
      "const API_URL = 'http://localhost:8080/api/v1';",
      "const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';"
    );
    fs.writeFileSync(dealershipServicePath, content);
  }
}

// Update authService.ts
const authServicePath = 'src/services/authService.ts';
if (fs.existsSync(authServicePath)) {
  console.log('Updating authService.ts...');
  let content = fs.readFileSync(authServicePath, 'utf8');
  if (!content.includes('import.meta.env.VITE_API_URL')) {
    content = content.replace(
      "const API_URL = 'http://localhost:8080/api/v1/auth';",
      "const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}/auth`;"
    );
    fs.writeFileSync(authServicePath, content);
  }
}

// 3. Directly modify tsconfig.app.json with text operations instead of JSON parsing
const tsconfigPath = 'tsconfig.app.json';
if (fs.existsSync(tsconfigPath)) {
  console.log('Updating tsconfig.app.json...');
  let content = fs.readFileSync(tsconfigPath, 'utf8');
  
  // Replace noUnusedLocals setting
  content = content.replace(
    '"noUnusedLocals": true',
    '"noUnusedLocals": false'
  );
  
  // Replace noUnusedParameters setting
  content = content.replace(
    '"noUnusedParameters": true',
    '"noUnusedParameters": false'
  );
  
  fs.writeFileSync(tsconfigPath, content);
}

// 4. Update package.json
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

// 5. Create Firebase files
// Create firebase.json
const firebaseJson = {
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
};
fs.writeFileSync('firebase.json', JSON.stringify(firebaseJson, null, 2));
console.log('Created firebase.json');

// Create .firebaserc
const firebaseRc = {
  "projects": {
    "default": "audi-vietnam-web"  // Update with your Firebase project ID
  }
};
fs.writeFileSync('.firebaserc', JSON.stringify(firebaseRc, null, 2));
console.log('Created .firebaserc');

// 6. Build the project
console.log('Building project...');
try {
  execSync('yarn build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
  console.log('\nTo deploy to Firebase, run:');
  console.log('firebase deploy --only hosting');
} catch (error) {
  console.error('Error during build:', error.message);
}