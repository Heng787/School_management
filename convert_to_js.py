
import os
import re

def convert_content(content):
    # 1. Remove all interfaces and types
    while True:
        new_content = re.sub(r'(interface|type)\s+[A-Za-z0-9_]+\s*(\=[^;]+;|\{[^}]*\}|(?<=\{)[\s\S]*?(?=\n\}))', '', content)
        if new_content == content: break
        content = new_content
    
    # 2. Remove generics: `<Student[]>`, `<any>`, `<string|number>` (ensure not to touch JSX)
    # Target only specific React patterns to be safe
    content = re.sub(r'(useState|useRef|useCallback|useMemo|createContext|createRef|forwardRef)\s*<[^>]+>', r'\1', content)
    
    # 3. Explicit casts: `as Type`
    # Also handles multiple types like `as Student | null`
    content = re.sub(r'\s+as\s+[A-Z][a-zA-Z0-9\[\]|&\s<>]+(?=[\s,=;)])', '', content)
    
    # 4. Remove Function Component types: `: React.FC<...>` or `: FC`
    content = re.sub(r':\s*(React\.)?FC\s*(<[^>]+>)?', '', content)
    
    # 5. Remove return type annotations from functions: `): Student {` -> `) {`
    content = re.sub(r'\)\s*:\s*([A-Z][a-zA-Z0-9\[\]|&\s]+|string|number|boolean|any|void|null|undefined)(?=\s*\{)', ')', content)
    
    # 6. Remove parameter type annotations from arrows and functions: `(data: Student)` -> `(data)`
    # This regex is more specific: looks for colon, space, and then a Type at the end of parameter list
    content = re.sub(r':\s*([A-Z][a-zA-Z0-9\[\]\|&\s<>]*|string|number|boolean|any|void|null|undefined)(?=[,=)])', '', content)
    
    # 7. Remove optional markers in props/definitions: `prop?: string` -> `prop` (we already removed the `: type`)
    content = re.sub(r'([a-zA-Z0-9_]+)\?(?=\s*[,=)])', r'\1', content)
    
    # 8. Variable/Object property type annotations: `const a: string = "b"` -> `const a = "b"`
    # But ONLY for capitalized words or primitives to avoid matching SVG `: ` colons etc.
    content = re.sub(r':\s*([A-Z][a-zA-Z0-9_\[\]\|]+|string|number|boolean|any|void|null|undefined)(?=\s*[=;])', '', content)

    # 9. TypeScript internal keywords
    content = re.sub(r'\b(public|private|protected|readonly|keyof)\b\s+', '', content)
    
    # 10. Fix up common leftovers
    content = content.replace('DataContextType', '')
    
    # Clean up multiple newlines
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    return content

def process_project(base_dir):
    for root, dirs, files in os.walk(base_dir):
        if 'node_modules' in dirs: dirs.remove('node_modules')
        if '.git' in dirs: dirs.remove('.git')
        
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                path = os.path.join(root, file)
                print(f"Refining: {file}")
                
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Special handling for enum-like files (like types.ts)
                if file == 'types.ts':
                    # Convert enums to objects
                    content = re.sub(r'export\s+enum\s+(\w+)\s*\{', r'export const \1 = {', content)
                
                new_content = convert_content(content)
                
                new_ext = '.jsx' if file.endswith('.tsx') else '.js'
                new_file = os.path.splitext(file)[0] + new_ext
                new_path = os.path.join(root, new_file)
                
                with open(new_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                # Delete original TS files
                try: os.remove(path)
                except: pass

if __name__ == "__main__":
    process_project(r'd:\news g\sana-work\schools-admin - Copy')
