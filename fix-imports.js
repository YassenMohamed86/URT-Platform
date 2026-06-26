import fs from 'fs';
import path from 'path';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We want to match paths starting with '.' and NOT ending with '.js' or '.json'
      // Example: from "../../db/schema"
      const replaceRegex = /(from|import)\s+(type\s+)?["'](\.[^"']+)["']/g;
      
      content = content.replace(replaceRegex, (match, keyword, typeStr, importPath) => {
        if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
            const prefix = typeStr ? `type ${typeStr}` : '';
            if (keyword === 'import' && !match.includes('from')) {
              // side effect import like `import "./lib/env"`
              return `import "${importPath}.js"`;
            }
            // we can just replace the whole match but append .js to the importPath
            return match.replace(importPath, `${importPath}.js`);
        }
        return match;
      });

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory('./server');
processDirectory('./api');
processDirectory('./db');
console.log("Done fixing imports again!");
