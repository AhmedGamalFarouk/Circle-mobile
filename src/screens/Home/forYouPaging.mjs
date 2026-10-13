// Paging rules for the For You tab. Pure, so forYouPaging.check.mjs can run it in node.
export const PAGE_SIZE = 24;
// A trigger (first load, scroll to end, Try again) keeps loading pages until it has
// added this many visible cards...
export const MIN_NEW_PER_TRIGGER = 6;
// ...or loaded this many pages.
// ponytail: up to 72 docs read per trigger; lower it if reads cost matters.
export const MAX_PAGES_PER_TRIGGER = 3;

const toMs = (ts) => (ts?.toDate ? ts.toDate().getTime() : 0);
const isExpiredFlash = (circle, nowMs) =>
    circle.circleType === 'flash' && !!circle.expiresAt && toMs(circle.expiresAt) <= nowMs;
const matchScore = (circle, interests) =>
    (circle.interests || []).filter((i) => interests.includes(i)).length;

// Appends one fetched page to the shown list. Drops joined circles, expired flash
// circles and circles already shown, then sorts only the new cards (best interest
// match first, newest first on ties), so cards already on screen never move.
export function mergeForYouBatch(existing, batch, { joinedIds = [], interests = [], now = new Date() } = {}) {
    const seen = new Set(existing.map((c) => c.id));
    const joined = new Set(joinedIds);
    const nowMs = now.getTime();
    const fresh = [];
    for (const circle of batch) {
        if (seen.has(circle.id) || joined.has(circle.id) || isExpiredFlash(circle, nowMs)) continue;
        seen.add(circle.id);
        fresh.push(circle);
    }
    fresh.sort((a, b) =>
        matchScore(b, interests) - matchScore(a, interests) || toMs(b.createdAt) - toMs(a.createdAt));
    return { circles: [...existing, ...fresh], added: fresh.length };
}
