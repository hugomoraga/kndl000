const yaml = require('js-yaml');
const fs = require('fs');
const json = JSON.parse(fs.readFileSync('fragmentos.json', 'utf8'));
const yamlContent = yaml.dump(json, { lineWidth: -1 });
fs.writeFileSync('_data/fragmentos.yml', yamlContent, 'utf8');
console.log('Sincronizado a _data/fragmentos.yml');
