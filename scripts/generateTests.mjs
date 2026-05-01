import fs from 'fs';
import path from 'path';

const dirsToScan = [
  'backend/src/controllers',
  'backend/src/services',
  'backend/src/repositories',
  'components',
  'context/hooks',
  'hooks',
  'services',
  'utils'
];

// Regex to find exported functions, classes, and components
// Matches: export const foo =, export function foo, export class foo, export default function foo, module.exports = new Foo()
const exportRegex = /export\s+(?:default\s+)?(?:const|let|var|function|class)\s+([a-zA-Z0-9_]+)/g;
const moduleExportRegex = /module\.exports\s*=\s*(?:new\s+)?([a-zA-Z0-9_]+)/g;

function getExports(fileContent) {
  const exports = new Set();
  let match;
  
  while ((match = exportRegex.exec(fileContent)) !== null) {
    if (match[1]) exports.add(match[1]);
  }
  
  while ((match = moduleExportRegex.exec(fileContent)) !== null) {
    if (match[1]) exports.add(match[1]);
  }

  return Array.from(exports);
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if ((file.endsWith('.js') || file.endsWith('.jsx')) && !file.endsWith('.test.js') && !file.endsWith('.test.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const exports = getExports(content);
      
      // Also grab the filename without extension as a default fallback if no exports found (e.g., default exports without name or class instances)
      const baseName = path.basename(file, path.extname(file));
      if (exports.length === 0) {
        exports.push(baseName);
      }

      generateTestFile(fullPath, exports);
    }
  }
}

function generateTestFile(sourcePath, exports) {
  const isFrontend = !sourcePath.includes('backend');
  const isComponent = sourcePath.includes('components');
  const isHook = sourcePath.includes('hooks');
  const ext = sourcePath.endsWith('.jsx') ? '.test.jsx' : '.test.js';
  const testPath = sourcePath.replace(/\.jsx?$/, ext);

  // If test file already exists, don't overwrite
  if (fs.existsSync(testPath)) {
    return;
  }

  let content = `// Auto-generated test scaffolding\n`;
  content += `import { describe, it, expect, beforeEach, vi } from 'vitest';\n`;
  
  if (isComponent) {
    content += `import { render, screen, fireEvent } from '@testing-library/react';\n`;
  } else if (isHook) {
    content += `import { renderHook, act } from '@testing-library/react';\n`;
  }

  // Calculate relative path for import
  const relativeImport = './' + path.basename(sourcePath);
  
  // We don't know the exact import structure, so we just comment it out
  content += `// import * as ModuleToTest from '${relativeImport}';\n\n`;

  for (const exp of exports) {
    content += `describe('${exp}', () => {\n`;
    
    if (isComponent) {
      content += `  it('should render correctly with default props', () => {\n`;
      content += `    // Arrange & Act\n`;
      content += `    // render(<${exp} />);\n`;
      content += `    \n`;
      content += `    // Assert\n`;
      content += `    // expect(screen.getByText('...')).toBeInTheDocument();\n`;
      content += `  });\n\n`;
      content += `  it('should handle user interactions', () => {\n`;
      content += `    // TODO: implement\n`;
      content += `  });\n`;
    } else if (isHook) {
      content += `  it('should return correct initial state', () => {\n`;
      content += `    // const { result } = renderHook(() => ${exp}());\n`;
      content += `    // expect(result.current).toBeDefined();\n`;
      content += `  });\n\n`;
      content += `  it('should update state correctly on action', () => {\n`;
      content += `    // TODO: implement\n`;
      content += `  });\n`;
    } else {
      content += `  it('should return correct result for valid input', async () => {\n`;
      content += `    // Arrange\n`;
      content += `    // const input = ...\n\n`;
      content += `    // Act\n`;
      content += `    // const result = await ${exp}(input);\n\n`;
      content += `    // Assert\n`;
      content += `    // expect(result).toEqual(...);\n`;
      content += `  });\n\n`;
      content += `  it('should handle edge cases and boundaries', () => {\n`;
      content += `    // TODO: implement\n`;
      content += `  });\n`;
      content += `  it('should throw correct error types for invalid cases', () => {\n`;
      content += `    // TODO: implement\n`;
      content += `  });\n`;
    }
    
    content += `});\n\n`;
  }

  fs.writeFileSync(testPath, content, 'utf8');
  console.log(`Generated: ${testPath}`);
}

dirsToScan.forEach(dir => processDirectory(path.join(process.cwd(), dir)));

// Generate E2E Scaffolds
const e2eDir = path.join(process.cwd(), 'tests/e2e');
if (!fs.existsSync(e2eDir)) fs.mkdirSync(e2eDir, { recursive: true });

const e2eFiles = ['auth.spec.js', 'students.spec.js', 'sync.spec.js', 'dashboard.spec.js'];
for (const file of e2eFiles) {
  const p = path.join(e2eDir, file);
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, 
`import { test, expect } from '@playwright/test';

test.describe('${file.replace('.spec.js', '')} critical flows', () => {
  test('should complete primary success path', async ({ page }) => {
    // TODO: implement E2E flow
  });
  
  test('should handle primary failure paths', async ({ page }) => {
    // TODO: implement E2E flow
  });
});
`
    );
    console.log(`Generated E2E: ${p}`);
  }
}

// Generate setup files
const testSetupDir = path.join(process.cwd(), 'test');
if (!fs.existsSync(testSetupDir)) fs.mkdirSync(testSetupDir, { recursive: true });
const setupFrontend = path.join(testSetupDir, 'setup.js');
if (!fs.existsSync(setupFrontend)) {
  fs.writeFileSync(setupFrontend, `import '@testing-library/jest-dom';\n// Setup global mocks (fetch, localStorage, IndexedDB) here.\n`);
  console.log('Generated Frontend Setup');
}

const backendTestSetupDir = path.join(process.cwd(), 'backend/test');
if (!fs.existsSync(backendTestSetupDir)) fs.mkdirSync(backendTestSetupDir, { recursive: true });
const setupBackend = path.join(backendTestSetupDir, 'setup.js');
if (!fs.existsSync(setupBackend)) {
  fs.writeFileSync(setupBackend, `// Setup global backend mocks (Supabase, process.env) here.\n`);
  console.log('Generated Backend Setup');
}

console.log('All test scaffolding generated!');
