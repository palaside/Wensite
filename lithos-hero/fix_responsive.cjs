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

  replace(/text-\[40px\]/g, 'text-lg sm:text-2xl md:text-[40px]');
  replace(/text-\[30px\]/g, 'text-base sm:text-xl md:text-[30px]');
  replace(/text-\[50px\]/g, 'text-xl sm:text-3xl md:text-[50px]');
  replace(/text-\[60px\]/g, 'text-2xl sm:text-4xl md:text-[60px]');
  replace(/text-\[24px\]/g, 'text-sm sm:text-lg md:text-[24px]');
  replace(/text-\[32px\]/g, 'text-base sm:text-xl md:text-[32px]');
  replace(/text-\[36px\]/g, 'text-base sm:text-xl md:text-[36px]');
  
  replace(/w-\[500px\]/g, 'w-full md:w-[500px]');
  replace(/min-w-\[500px\]/g, 'min-w-[300px] md:min-w-[500px]');
  
  // Custom fix for common flex-row splits in calculators
  replace(/flex flex-row w-full/g, 'flex flex-col md:flex-row w-full');
  replace(/w-1\/2/g, 'w-full md:w-1/2');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log('Automated responsive text replacement complete.');
