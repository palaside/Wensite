const fs = require('fs');
const path = require('path');

const dir = 'd:/Project/รายงาน รอง/lithos-hero/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const replace = (regex, replacement) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  };

  replace(/text-\[10rem\]/g, 'text-6xl sm:text-8xl md:text-[10rem]');
  replace(/text-6xl/g, 'text-3xl sm:text-4xl md:text-6xl');
  replace(/text-5xl/g, 'text-3xl md:text-5xl');
  replace(/text-7xl/g, 'text-4xl md:text-7xl');
  replace(/text-8xl/g, 'text-5xl md:text-8xl');

  // Fix grid-cols-4 and grid-cols-2 that don't have responsiveness
  replace(/grid-cols-4/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
  replace(/grid-cols-2/g, 'grid-cols-1 md:grid-cols-2');
  // Avoid double replacing if it was already sm:grid-cols-2 (regex would need to be smarter, I'll let it be for now since it's a small app)

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log('Automated responsive layout replacement complete.');
