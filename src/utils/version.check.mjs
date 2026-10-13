// node src/utils/version.check.mjs
import assert from 'node:assert/strict';
import { isOlderVersion } from './version.mjs';

assert.equal(isOlderVersion('1.0.0', '1.0.1'), true);
assert.equal(isOlderVersion('1.2.9', '1.2.10'), true);
assert.equal(isOlderVersion('1.2.10', '1.2.9'), false);
assert.equal(isOlderVersion('1.0.0', '1.0.0'), false);
assert.equal(isOlderVersion('1.0', '1.0.0'), false);
assert.equal(isOlderVersion('1.0', '1.0.1'), true);
assert.equal(isOlderVersion('2.0.0', '1.9.9'), false);
// Bad input never blocks.
assert.equal(isOlderVersion('1.0.0', undefined), false);
assert.equal(isOlderVersion('1.0.0', 'v2'), false);
assert.equal(isOlderVersion(undefined, '1.0.0'), false);
console.log('version: all checks passed');
