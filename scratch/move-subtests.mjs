import fs from 'fs';
import path from 'path';

const componentsDir = path.resolve('d:/Code/School-system-for-admin/components');

function processDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    const testFiles = items.filter(f => {
        const fullPath = path.join(dir, f);
        try {
            return fs.statSync(fullPath).isFile() && (f.endsWith('.test.jsx') || f.endsWith('.test.js'));
        } catch (e) {
            return false;
        }
    });

    if (testFiles.length > 0) {
        const testDir = path.join(dir, 'test');
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }

        for (const file of testFiles) {
            const oldPath = path.join(dir, file);
            const newPath = path.join(testDir, file);
            
            let content = fs.readFileSync(oldPath, 'utf8');
            
            content = content.replace(/from\s+['"]\.\.\/\.\.\/([^'"]+)['"]/g, "from '../../../$1'");
            content = content.replace(/import\s+(.*?)\s+from\s+['"]\.\.\/\.\.\/([^'"]+)['"]/g, "import $1 from '../../../$2'");
            content = content.replace(/vi\.mock\(['"]\.\.\/\.\.\/([^'"]+)['"]/g, "vi.mock('../../../$1'");

            content = content.replace(/(from|import\s+.*?from|vi\.mock\()\s*['"](\.\/|\.\.\/)([^'"]+)['"]/g, (match, p1, p2, p3) => {
                return `${p1} '../${p2}${p3}'`;
            });

            fs.writeFileSync(newPath, content, 'utf8');
            fs.unlinkSync(oldPath);
            
            console.log(`Moved and updated imports: ${path.relative(componentsDir, oldPath)} -> ${path.relative(componentsDir, newPath)}`);
        }
    }

    // Refresh items to avoid statSync on deleted files
    const updatedItems = fs.readdirSync(dir);
    const subdirs = updatedItems.filter(f => {
        const fullPath = path.join(dir, f);
        try {
            return fs.statSync(fullPath).isDirectory() && f !== 'test';
        } catch (e) {
            return false;
        }
    });

    for (const subdir of subdirs) {
        processDirectory(path.join(dir, subdir));
    }
}

console.log('Starting migration of test files in subdirectories...');
processDirectory(componentsDir);
console.log('All test files moved successfully.');
