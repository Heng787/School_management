
import os
import re

def refine_js(content):
    # 1. Dictionary/Record annotations: ": { [key: string]: ... }" or ": { [key: string] }"
    content = re.sub(r':\s*\{\s*\[\s*key\s*:\s*string\s*\]\s*(:\s*[^}]*)?\}', '', content)
    
    # 2. Generic Promise/Array types
    content = re.sub(r':\s*Promise<[^>]*>', '', content)
    content = re.sub(r':\s*[A-Z][a-zA-Z0-9_\.]+(\[\])?(?=[\s,=;)])', '', content)
    
    # 3. Primitive annotations
    content = re.sub(r':\s*(string|number|boolean|any|void|null|undefined|Date)(\[\])?(?=[\s,=;)])', '', content)

    # 4. Optional property markers in objects/params
    content = re.sub(r'([a-zA-Z0-9_]+)\?(?=\s*[:=,])', r'\1', content)
    
    # 5. Type casts "as Type"
    content = re.sub(r'\s+as\s+[a-zA-Z0-9\[\]|&\s<>{}]+(?=[\s,=;)])', '', content)

    # 6. React types
    content = re.sub(r':\s*(React\.)?FC\s*(<[^>]+>)?', '', content)
    content = re.sub(r',?\s*(React\.)?ReactNode', '', content)
    
    # 7. Function generic brackets after a name
    content = re.sub(r'<\s*[A-Z][a-zA-Z0-9\[\]\|,\s<>{} :\*]*\s*>', '', content)

    return content

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs: dirs.remove('node_modules')
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                path = os.path.join(root, file)
                print(f"Refining: {path}")
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                new_content = refine_js(content)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)

if __name__ == "__main__":
    process_directory(r'd:\news g\sana-work\schools-admin - Copy')
