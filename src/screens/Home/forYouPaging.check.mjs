// node src/screens/Home/forYouPaging.check.mjs
import assert from 'node:assert/strict';
import { mergeForYouBatch } from './forYouPaging.mjs';

const ts = (iso) => ({ toDate: () => new Date(iso) });
const now = new Date('2026-10-13T12:00:00Z');
const c = (id, created, extra = {}) => ({ id, createdAt: ts(created), ...extra });

// Per-batch sort: interest matches first, newest first on ties.
const first = mergeForYouBatch([], [
    c('a', '2026-10-10'),
    c('b', '2026-10-12'),
    c('c', '2026-10-01', { interests: ['chess', 'music'] }),
    c('d', '2026-10-05', { interests: ['music'] }),
], { interests: ['music', 'chess'], now });
assert.deepEqual(first.circles.map((x) => x.id), ['c', 'd', 'b', 'a']);
assert.equal(first.added, 4);

// Append only: a better match in page 2 goes below page 1; duplicates, joined and
// expired flash circles are dropped.
const second = mergeForYouBatch(first.circles, [
    c('a', '2026-10-10'),
    c('e', '2026-09-01', { interests: ['chess', 'music'] }),
    c('f', '2026-09-02'),
    c('g', '2026-09-03', { circleType: 'flash', expiresAt: ts('2026-10-13T11:00:00Z') }),
    c('h', '2026-09-04', { circleType: 'flash', expiresAt: ts('2026-10-14T00:00:00Z') }),
    c('f', '2026-09-02'),
], { joinedIds: ['f'], interests: ['music', 'chess'], now });
assert.deepEqual(second.circles.map((x) => x.id), ['c', 'd', 'b', 'a', 'e', 'h']);
assert.equal(second.added, 2);

// Missing createdAt sorts last instead of throwing.
assert.deepEqual(mergeForYouBatch([], [{ id: 'x' }, c('y', '2026-01-01')], { now }).circles.map((x) => x.id), ['y', 'x']);

console.log('forYouPaging: all checks passed');
