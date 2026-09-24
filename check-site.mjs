import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 const ref=m[1];if(/^(https?:|data:)/.test(ref))continue;
 if(ref.startsWith('#'))assert.ok(html.includes(`id="${ref.slice(1)}"`),`Missing anchor ${ref}`);
 else assert.ok(fs.existsSync(path.resolve(ref.split('#')[0])),`Missing local resource ${ref}`);
}
for(const record of JSON.parse(fs.readFileSync('docs/asset-provenance.json','utf8'))){
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(record.published)).digest('hex'),record.sha256,record.original);
}
for(const id of ['net-diagram','baseline-wiring','cattle-wiring','sets-diagram'])assert.match(html,new RegExp(`id="${id}"[^>]*><svg`),'Static diagram missing');
assert.ok(html.indexOf('assets/farm-track-hero.png')<html.indexOf('assets/risk-trees.webp'));
assert.ok(!html.includes('/Users/')&&!html.includes('x-devonthink-item:'));
console.log('PASS: local links, six original-image hashes, four static diagrams, hero order, public page boundary.');
