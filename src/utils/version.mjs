// "1.2.10" vs "1.2.9": numeric per part; missing parts count as 0.
// Anything unparseable is treated as not older, so a bad config value never locks users out.
export function isOlderVersion(current, minimum) {
    const parse = (v) => (typeof v === 'string' && /^\d+(\.\d+)*$/.test(v.trim()) ? v.trim().split('.').map(Number) : null);
    const a = parse(current);
    const b = parse(minimum);
    if (!a || !b) return false;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const diff = (a[i] || 0) - (b[i] || 0);
        if (diff !== 0) return diff < 0;
    }
    return false;
}
