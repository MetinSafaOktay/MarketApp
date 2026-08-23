const http = require('http');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const port = process.env.PORT || 3000;

http.get(`http://localhost:${port}/api-json`, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    const json = JSON.parse(data);
    const outPath = path.join(__dirname, '..', '..', 'docs', 'api-spec.yaml');
    fs.writeFileSync(outPath, yaml.dump(json));
    console.log(`OpenAPI şeması yazıldı: ${outPath}`);
  });
}).on('error', (err) => {
  console.error('Sunucu çalışmıyor olabilir (npm run start:dev ile başlatın):', err.message);
  process.exit(1);
});
