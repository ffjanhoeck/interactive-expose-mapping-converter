const fs = require('fs');
const Converter = require('./Converter');

async function run() {
    const mappingString = await fs.readFileSync('defaultMapping.json');
    const convertedMapping = Converter.convertMapping(JSON.parse(mappingString));
    await fs.writeFileSync('convertedMapping.json', JSON.stringify(convertedMapping, null, 2));
}

run();
