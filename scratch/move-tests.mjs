import fs from 'fs';
import path from 'path';

const componentsDir = path.resolve('d:/Code/School-system-for-admin/components');
const testDir = path.join(componentsDir, 'test');

if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Get all files in componentsDir
const files = fs.readdirSync(componentsDir);

// Filter for .test.jsx or .test.js
const testFiles = files.filter(f => f.endsWith('.test.jsx') || f.endsWith('.test.js'));

for (const file of testFiles) {
  const oldPath = path.join(componentsDir, file);
  const newPath = path.join(testDir, file);
  
  // Read content
  let content = fs.readFileSync(oldPath, 'utf8');
  
  // Update imports:
  // ./Component -> ../Component
  // ../context -> ../../context
  // etc.
  
  // Basic replacement strategy:
  // Replace from '../' to '../../'
  content = content.replace(/from\s+['"]\.\.\/([^'"]+)['"]/g, "from '../../$1'");
  content = content.replace(/import\s+(.*?)\s+from\s+['"]\.\.\/([^'"]+)['"]/g, "import $1 from '../../$2'");
  
  // Replace from './' to '../'
  content = content.replace(/from\s+['"]\.\/([^'"]+)['"]/g, "from '../$1'");
  content = content.replace(/import\s+(.*?)\s+from\s+['"]\.\/([^'"]+)['"]/g, "import $1 from '../$2'");
  
  // Replace vi.mock paths
  content = content.replace(/vi\.mock\(['"]\.\.\/([^'"]+)['"]/g, "vi.mock('../../$1'");
  content = content.replace(/vi\.mock\(['"]\.\/([^'"]+)['"]/g, "vi.mock('../$1'");
  
  // Write to new path
  fs.writeFileSync(newPath, content, 'utf8');
  
  // Delete old file
  fs.unlinkSync(oldPath);
  
  console.log(`Moved and updated imports: ${file}`);
}

console.log('All test files moved successfully.');
