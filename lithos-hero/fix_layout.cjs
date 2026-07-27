const fs = require('fs');
const path = require('path');

const dir = 'd:/Project/รายงาน รอง/lithos-hero/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Fixed Width Conversions -> Responsive Max-Width
  content = content.replace(/\bw-\[([3-9]\d{2,}|[1-9]\d{3,})px\]\b/g, 'w-[95%] max-w-[$1px]');
  
  // 2. Fixed Heights -> Max Heights + Overflow
  content = content.replace(/\bh-\[([4-9]\d{2,}|[1-9]\d{3,})px\]\b/g, 'h-auto max-h-[$1px] overflow-y-auto');

  // 3. Flex Direction (Mobile First)
  // Be careful not to replace already responsive ones.
  content = content.replace(/\bflex-row\b(?! md:)/g, 'flex-col md:flex-row');

  // 4. Fractional Widths
  content = content.replace(/\bw-1\/2\b(?! md:)/g, 'w-full md:w-1/2');
  content = content.replace(/\bw-1\/3\b(?! md:)/g, 'w-full md:w-1/3');
  content = content.replace(/\bw-2\/3\b(?! md:)/g, 'w-full md:w-2/3');
  content = content.replace(/\bw-1\/4\b(?! md:)/g, 'w-full md:w-1/4');
  content = content.replace(/\bw-3\/4\b(?! md:)/g, 'w-full md:w-3/4');

  // 5. Grid Columns
  content = content.replace(/\bgrid-cols-2\b(?! md:)/g, 'grid-cols-1 md:grid-cols-2');
  content = content.replace(/\bgrid-cols-3\b(?! md:)/g, 'grid-cols-1 md:grid-cols-3');
  content = content.replace(/\bgrid-cols-4\b(?! md:| lg:)/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
  content = content.replace(/\bgrid-cols-5\b(?! md:| lg:)/g, 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5');

  // 6. Massive Paddings
  content = content.replace(/\bp-10\b(?! md:)/g, 'p-4 md:p-10');
  content = content.replace(/\bp-12\b(?! md:)/g, 'p-4 md:p-12');
  content = content.replace(/\bp-16\b(?! md:)/g, 'p-4 md:p-16');
  content = content.replace(/\bp-20\b(?! md:)/g, 'p-4 md:p-20');
  content = content.replace(/\bpx-10\b(?! md:)/g, 'px-4 md:px-10');
  content = content.replace(/\bpx-16\b(?! md:)/g, 'px-4 md:px-16');
  
  // 7. Modals inner container overflow (find max-w- and make sure it has max-h-[90vh] overflow-y-auto)
  // This is a bit too risky with regex, I'll let the height replacement above handle most, and manually audit modals.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Aggressively updated layout classes in ${file}`);
  }
}
console.log('Automated responsive layout overhaul script completed.');
