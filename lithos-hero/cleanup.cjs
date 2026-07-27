const fs = require('fs');
const path = require('path');

const dir = 'd:/Project/รายงาน รอง/lithos-hero/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Clean up duplicate grid-cols classes
  content = content.replace(/grid-cols-1 md:grid-cols-1 md:grid-cols-3/g, 'grid-cols-1 md:grid-cols-3');
  content = content.replace(/grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2/g, 'grid-cols-1 md:grid-cols-2');
  content = content.replace(/grid-cols-1 md:grid-cols-1 sm:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
  content = content.replace(/grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');

  // Also clean up any flex-col md:flex-col md:flex-row
  content = content.replace(/flex-col md:flex-col md:flex-row/g, 'flex-col md:flex-row');

  // Clean up w-full md:w-full md:w-1\/2
  content = content.replace(/w-full md:w-full md:w-1\/2/g, 'w-full md:w-1/2');

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Cleaned up duplicated tailwind classes.');
