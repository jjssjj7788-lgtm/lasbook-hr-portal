const fs = require('fs');
const path = 'c:\\Users\\정상진\\OneDrive\\바탕 화면\\라스북\\직원 관리 프로젝트\\frontend\\src\\pages\\admin\\EmployeeDetail.tsx';

const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

let fixed = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('] as [string, string][].map(([val, label])')) {
    console.log('Found at line:', i + 1);
    console.log('Before:', lines[i]);
    lines[i] = lines[i]
      .replace('{[[\'\'', '{([[\'\'')
      .replace('] as [string, string][].map(([val, label])', '] as Array<[string, string]>).map(([val, label])');
    console.log('After:', lines[i]);
    fixed = true;
    break;
  }
}

if (fixed) {
  // Also fix closing ))  →  ))) on the next closing line  
  // The .map returns need an extra ) due to the outer ( we added
  fs.writeFileSync(path, lines.join('\n'), 'utf8');
  console.log('File saved!');
} else {
  console.log('Pattern not found, checking nearby lines...');
  lines.forEach((l, i) => {
    if (l.includes('worksInStore') && l.includes('map')) {
      console.log(`Line ${i+1}: ${l.trim()}`);
    }
  });
}
