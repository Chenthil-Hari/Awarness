const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./app');
let count = 0;
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('Navbar') && !f.includes('Navbar.js') && !f.includes('BentoWrapper.js')) {
    const original = c;
    // Remove import Navbar from '...' or "..."
    c = c.replace(/import\s+Navbar\s+from\s+['"].*?Navbar['"];?\s*\n?/g, '');
    // Remove <Navbar />
    c = c.replace(/<Navbar\s*\/>(?:\s*\n)?/g, '');
    
    if (original !== c) {
      fs.writeFileSync(f, c, 'utf8');
      console.log('Cleaned up Navbar from:', f);
      count++;
    }
  }
});
console.log('Total files cleaned:', count);
